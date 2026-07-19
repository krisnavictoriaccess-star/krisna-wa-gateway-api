process.env.TZ = 'Asia/Jakarta';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const deviceProcessing = {};
const pendingIPCTimeouts = {};
const messageAttempts = {};
const MAX_RETRIES = 3;
function logWorkerBox(title, message, isError = false) {
    const moment = require('moment');
    require('moment/locale/id');
    moment.locale('id');
    const time = moment().format('dddd, HH:mm:ss [WIB]');
    
    const lines = [`Waktu  : ${time}`, ...message.split('\n')];
    const maxLength = Math.max(title.length, ...lines.map(l => l.length));
    const border = '='.repeat(maxLength);
    const separator = '-'.repeat(maxLength);
    const color = isError ? '\x1b[31m' : '\x1b[36m';
    const titleColor = isError ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(color + border + reset);
    console.log(titleColor + title + reset);
    console.log(color + separator + reset);
    for(let l of lines) console.log(l);
    console.log(color + border + reset + '\n');
}


async function handleFailedMessage(id, sender_device, error_message, api_key_id = null) {
    let attempts = messageAttempts[id] || 0;
    attempts++;
    messageAttempts[id] = attempts;

    if (attempts >= MAX_RETRIES) {
        await prisma.messageQueue.update({ where: { id }, data: { status: 'failed', error_message: `Gagal permanen setelah ${MAX_RETRIES} percobaan: ${error_message}` } });
        // Refund Kuota (Karena charge sudah dilakukan di awal)
        if (api_key_id) {
             await prisma.apiKey.update({ where: { key: api_key_id }, data: { terpakai_bulan_ini: { decrement: 1 } } }).catch(()=>{});
        }
        logWorkerBox('[QUEUE WORKER] FAILED', `Pesan ID : ${id}\nDevice : ${sender_device}\nAlasan : ${error_message}`, true);
    } else {
        const nextRetryDate = new Date();
        nextRetryDate.setMinutes(nextRetryDate.getMinutes() + attempts);
        
        await prisma.messageQueue.update({ where: { id }, data: { status: 'pending', send_at: nextRetryDate, error_message: `Gagal (Retry ${attempts}/${MAX_RETRIES}): ${error_message}` } });
        console.log(`[QUEUE WORKER] Retry ${attempts}/${MAX_RETRIES} untuk pesan ID ${id}. Ditunda sampai ${nextRetryDate.toISOString()}`);
    }
}


// Handle responses from parent process
process.on('message', async (msg) => {
    if (msg.type === 'send_result') {
        if (pendingIPCTimeouts[msg.id]) {
            clearTimeout(pendingIPCTimeouts[msg.id]);
            delete pendingIPCTimeouts[msg.id];
        }
        try {
            if (msg.status === 'success') {
                delete messageAttempts[msg.id]; // Hapus cache retry
                await prisma.messageQueue.update({ where: { id: msg.id }, data: { status: 'sent' } });
                logWorkerBox('[QUEUE WORKER] SUCCESS', `Pesan ID : ${msg.id}\nTujuan : ${msg.recipient_jid}\nDevice : ${msg.sender_device}`);
            } else {
                await handleFailedMessage(msg.id, msg.sender_device, msg.error, msg.api_key_id);
            }
        } catch(e) {
            console.error('[DATABASE ERROR] Gagal update status queue:', e.message);
        }
        
        // Random delay (4 - 10s) before unlocking the device
        const delay = Math.floor(Math.random() * (10000 - 4000 + 1) + 4000);
        setTimeout(() => {
            deviceProcessing[msg.sender_device] = false;
        }, delay);
    }
});

async function processQueue() {
    try {
        const pendingDevices = await prisma.messageQueue.findMany({
            where: { status: 'pending', send_at: { lte: new Date() } },
            select: { sender_device: true },
            distinct: ['sender_device']
        });
        
        const activeDeviceNumbers = pendingDevices.map(d => d.sender_device).filter(num => !deviceProcessing[num]);

        if (activeDeviceNumbers.length === 0) {
            setTimeout(processQueue, 2000);
            return;
        }

        await Promise.all(activeDeviceNumbers.map(async (sender_device) => {
            const pendingMsg = await prisma.messageQueue.findFirst({
                where: { 
                    status: 'pending',
                    send_at: { lte: new Date() },
                    sender_device: sender_device
                },
                orderBy: { createdAt: 'asc' }
            });

            if (pendingMsg) {
                deviceProcessing[sender_device] = true;
                await prisma.messageQueue.update({ where: { id: pendingMsg.id }, data: { status: 'processing' } });
                
                let payloadObj = {};
                try { payloadObj = JSON.parse(pendingMsg.payload); } catch(e){}

                // SPINTAX ENGINE (Anti-Spam Randomizer)
                const prosesSpintax = (teks) => {
                    if (typeof teks !== 'string') return teks;
                    const spintaxRegex = /\{([^{}]*)\}/g;
                    while (spintaxRegex.test(teks)) {
                        teks = teks.replace(spintaxRegex, (match, contents) => {
                            const choices = contents.split('|');
                            return choices[Math.floor(Math.random() * choices.length)];
                        });
                    }
                    return teks;
                };

                if (payloadObj.text) payloadObj.text = prosesSpintax(payloadObj.text);
                if (payloadObj.caption) payloadObj.caption = prosesSpintax(payloadObj.caption);

                let tempFilePath = null;
                const mediaUrl = payloadObj.image?.url || payloadObj.video?.url || payloadObj.document?.url;

                if (mediaUrl) {
                    try {
                        const tempExt = payloadObj.image ? '.jpg' : payloadObj.video ? '.mp4' : '.pdf';
                        const tempFileName = crypto.randomUUID() + tempExt;
                        const dirPath = path.join(__dirname, 'temp');
                        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
                        tempFilePath = path.join(dirPath, tempFileName);
                        
                        const response = await axios({
                            method: 'GET',
                            url: mediaUrl,
                            responseType: 'stream',
                            timeout: 30000 // 30s timeout for download
                        });
                        
                        const writer = fs.createWriteStream(tempFilePath);
                        response.data.pipe(writer);
                        await new Promise((resolve, reject) => {
                            writer.on('finish', resolve);
                            writer.on('error', reject);
                        });
                        
                        // Hapus URL dari payload untuk digantikan dengan buffer nanti di index.js
                        if (payloadObj.image) delete payloadObj.image.url;
                        if (payloadObj.video) delete payloadObj.video.url;
                        if (payloadObj.document) delete payloadObj.document.url;
                    } catch (err) {
                        throw new Error("Gagal mengunduh media dari URL: " + err.message);
                    }
                }

                // Send request to main process
                process.send({
                    type: 'send_message',
                    id: pendingMsg.id,
                    sender_device: pendingMsg.sender_device,
                    recipient_jid: pendingMsg.recipient_jid,
                    payload: payloadObj,
                    tempFilePath: tempFilePath,
                    api_key_id: pendingMsg.api_key_id
                });
                
                // Fallback Timeout if parent process hangs
                pendingIPCTimeouts[pendingMsg.id] = setTimeout(async () => {
                    console.error(`[QUEUE WORKER] Timeout 60s menunggu respon WhatsApp Engine untuk pesan ID ${pendingMsg.id}`);
                    try {
                        await handleFailedMessage(pendingMsg.id, pendingMsg.sender_device, 'Timeout: Tidak ada respon dari sistem WhatsApp (60 detik).');
                    } catch(e) {}
                    deviceProcessing[pendingMsg.sender_device] = false;
                    delete pendingIPCTimeouts[pendingMsg.id];
                }, 120000); // Timeout diubah ke 60 detik (1 Menit)
            }
        }));
    } catch (error) {
        console.error('[QUEUE WORKER ERROR]', error.message);
    }
    
    setTimeout(processQueue, 2000);
}

// --- WEBHOOK RETRY WORKER ---
async function processWebhookQueue() {
    try {
        const pendingWebhooks = await prisma.webhookQueue.findMany({
            where: {
                status: 'pending',
                next_retry: { lte: new Date() }
            },
            take: 20 // Process 20 at a time
        });
        
        if (pendingWebhooks.length > 0) {
            await prisma.webhookQueue.updateMany({
                where: { id: { in: pendingWebhooks.map(w => w.id) } },
                data: { status: 'processing' }
            });
        }

        for (const wh of pendingWebhooks) {
            try {
                let payload = {};
                try { payload = JSON.parse(wh.payload); } catch(e){}
                
                await axios.post(wh.url, payload, { timeout: 5000 });
                
                await prisma.webhookQueue.update({
                    where: { id: wh.id },
                    data: { status: 'success' }
                });
                console.log(`[WEBHOOK RETRY] Berhasil mengirim ulang event ke ${wh.url}`);
            } catch (error) {
                const newAttempts = wh.attempts + 1;
                let nextRetryDate = new Date();
                let newStatus = 'pending';

                if (newAttempts === 1) nextRetryDate.setMinutes(nextRetryDate.getMinutes() + 1);
                else if (newAttempts === 2) nextRetryDate.setMinutes(nextRetryDate.getMinutes() + 5);
                else if (newAttempts === 3) nextRetryDate.setMinutes(nextRetryDate.getMinutes() + 15);
                else newStatus = 'failed';

                await prisma.webhookQueue.update({
                    where: { id: wh.id },
                    data: {
                        attempts: newAttempts,
                        next_retry: nextRetryDate,
                        status: newStatus
                    }
                });
                console.error(`[WEBHOOK RETRY FAILED] Ke ${wh.url} (Attempt: ${newAttempts})`);
            }
        }
    } catch (e) {
        console.error('[WEBHOOK WORKER ERROR]', e.message);
    }

    setTimeout(processWebhookQueue, 10000);
}



async function startWorker() {
    await prisma.messageQueue.updateMany({
        where: { status: 'processing' },
        data: { status: 'pending' }
    });
    console.log('[QUEUE WORKER] Worker process started.');
    processQueue();
    processWebhookQueue();

}

startWorker();
