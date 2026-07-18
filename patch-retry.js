const fs = require('fs');

let code = fs.readFileSync('worker.js', 'utf8');

// Inject messageAttempts and MAX_RETRIES
const injectVars = `const deviceProcessing = {};
const pendingIPCTimeouts = {};
const messageAttempts = {};
const MAX_RETRIES = 3;

async function handleFailedMessage(id, sender_device, error_message) {
    let attempts = messageAttempts[id] || 0;
    attempts++;
    messageAttempts[id] = attempts;

    if (attempts >= MAX_RETRIES) {
        await prisma.messageQueue.update({ where: { id }, data: { status: 'failed', error_message: \`Gagal permanen setelah \${MAX_RETRIES} percobaan: \${error_message}\` } });
        console.error(\`[QUEUE WORKER] Gagal permanen kirim pesan ID \${id} via \${sender_device}: \${error_message}\`);
    } else {
        const nextRetryDate = new Date();
        nextRetryDate.setMinutes(nextRetryDate.getMinutes() + attempts);
        
        await prisma.messageQueue.update({ where: { id }, data: { status: 'pending', send_at: nextRetryDate, error_message: \`Gagal (Retry \${attempts}/\${MAX_RETRIES}): \${error_message}\` } });
        console.log(\`[QUEUE WORKER] Retry \${attempts}/\${MAX_RETRIES} untuk pesan ID \${id}. Ditunda sampai \${nextRetryDate.toISOString()}\`);
    }
}
`;

code = code.replace("const deviceProcessing = {};\nconst pendingIPCTimeouts = {};", injectVars);


// Inject successful delete and failed handler in process.on('message')
const oldIpcHandler = `            if (msg.status === 'success') {
                await prisma.messageQueue.update({ where: { id: msg.id }, data: { status: 'sent' } });
                await prisma.apiKey.update({ where: { key: msg.api_key_id }, data: { terpakai_bulan_ini: { increment: 1 } } });
                console.log(\`[QUEUE WORKER] Sukses kirim pesan ke \${msg.recipient_jid} via \${msg.sender_device}\`);
            } else {
                await prisma.messageQueue.update({ where: { id: msg.id }, data: { status: 'failed', error_message: msg.error } });
                console.error(\`[QUEUE WORKER] Gagal kirim ke \${msg.recipient_jid} via \${msg.sender_device}: \${msg.error}\`);
            }`;

const newIpcHandler = `            if (msg.status === 'success') {
                delete messageAttempts[msg.id]; // Hapus cache retry
                await prisma.messageQueue.update({ where: { id: msg.id }, data: { status: 'sent' } });
                await prisma.apiKey.update({ where: { key: msg.api_key_id }, data: { terpakai_bulan_ini: { increment: 1 } } });
                console.log(\`[QUEUE WORKER] Sukses kirim pesan ke \${msg.recipient_jid} via \${msg.sender_device}\`);
            } else {
                await handleFailedMessage(msg.id, msg.sender_device, msg.error);
            }`;

code = code.replace(oldIpcHandler, newIpcHandler);


// Inject failed handler in timeout
const oldTimeoutHandler = `                pendingIPCTimeouts[pendingMsg.id] = setTimeout(async () => {
                    console.error(\`[QUEUE WORKER] Timeout 30s menunggu respon WhatsApp Engine untuk pesan ID \${pendingMsg.id}\`);
                    try {
                        await prisma.messageQueue.update({ where: { id: pendingMsg.id }, data: { status: 'failed', error_message: 'Timeout: Tidak ada respon dari sistem WhatsApp.' } });
                    } catch(e) {}
                    deviceProcessing[pendingMsg.sender_device] = false;
                    delete pendingIPCTimeouts[pendingMsg.id];
                }, 30000);`;

const newTimeoutHandler = `                pendingIPCTimeouts[pendingMsg.id] = setTimeout(async () => {
                    console.error(\`[QUEUE WORKER] Timeout 60s menunggu respon WhatsApp Engine untuk pesan ID \${pendingMsg.id}\`);
                    try {
                        await handleFailedMessage(pendingMsg.id, pendingMsg.sender_device, 'Timeout: Tidak ada respon dari sistem WhatsApp (60 detik).');
                    } catch(e) {}
                    deviceProcessing[pendingMsg.sender_device] = false;
                    delete pendingIPCTimeouts[pendingMsg.id];
                }, 60000); // Timeout diubah ke 60 detik (1 Menit)`;

code = code.replace(oldTimeoutHandler, newTimeoutHandler);

fs.writeFileSync('worker.js', code);
console.log('worker.js patched for exponential backoff');
