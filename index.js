require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});
const { default: makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys');
const { usePrismaAuthState } = require('./usePrismaAuthState');
const { fork } = require('child_process');
const pino = require('pino');
const fs = require('fs');
process.env.TZ = 'Asia/Jakarta'; // Set global timezone ke WIB (Jakarta)
const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const crypto = require('crypto');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const moment = require('moment');
require('moment/locale/id'); // Load bahasa indonesia
moment.locale('id'); // Set default format hari/bulan ke Indonesia

// --- Socket.io Integration ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const helmet = require('helmet');
app.use(helmet()); // Poin 1: Helmet
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});
global.io = io; // Make io globally accessible

io.on('connection', (socket) => {
    console.log('[SOCKET] Client Frontend terhubung:', socket.id);
    socket.on('disconnect', () => {
        console.log('[SOCKET] Client Frontend terputus:', socket.id);
    });
});
// -----------------------------
global.autoReplyCache = {};
global.deviceCache = {};
// -----------------------------

// Limit 500 requests per minute by API Key or IP (diperlonggar untuk mendukung broadcast API)
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 500,
    keyGenerator: (req) => {
        return req.headers['x-api-key'] || req.query?.apikey || req.body?.apikey || req.socket?.remoteAddress;
    },
    message: { status: false, message: 'Terlalu banyak request. Silakan coba lagi nanti.' }
});
app.use(apiLimiter);

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Poin 5: 50MB JSON limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rute Statis untuk Dokumentasi
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==========================================
//        TERMINAL BEAUTIFIER (LOGGER)
// ==========================================
const COLORS = {
    reset: "\x1b[0m", blue: "\x1b[34m", green: "\x1b[32m", yellow: "\x1b[33m",
    red: "\x1b[31m", cyan: "\x1b[36m", magenta: "\x1b[35m", white: "\x1b[37m", gray: "\x1b[90m"
};

const originalLog = console.log;
const originalError = console.error;

function formatMessage(msgStr) {
    if (msgStr.includes('[WEBHOOK]')) return { color: COLORS.magenta, icon: '🪝', module: 'WEBHOOK', text: msgStr.replace(/\[.*?\]\s*/, '') };
    if (msgStr.includes('[WEBHOOK FAILED]') || msgStr.includes('[WEBHOOK-REPLY ERROR]')) return { color: COLORS.red, icon: '❌', module: 'WEBHOOK', text: msgStr.replace(/\[.*?\]\s*/, '') };
    if (msgStr.includes('[🤖 WEBHOOK-REPLY]')) return { color: COLORS.magenta, icon: '🤖', module: 'WEBHOOK', text: msgStr.replace(/\[.*?\]\s*/, '') };
    
    if (msgStr.includes('[🔄 SESSION]') || msgStr.includes('[✅ SESSION]') || msgStr.includes('[🗑️ SESSION]') || msgStr.includes('[SESSION]')) {
        let icon = msgStr.includes('✅') ? '✅' : msgStr.includes('🗑️') ? '🗑️' : '🔄';
        return { color: COLORS.green, icon: icon, module: 'SESSION', text: msgStr.replace(/\[.*?\]\s*/, '') };
    }
    
    if (msgStr.includes('[QUEUE WORKER]')) return { color: COLORS.blue, icon: '📤', module: 'QUEUE', text: msgStr.replace(/\[.*?\]\s*/, '') };
    if (msgStr.includes('[QUEUE WORKER ERROR]') || msgStr.includes('Gagal kirim')) return { color: COLORS.red, icon: '❌', module: 'QUEUE', text: msgStr.replace(/\[.*?\]\s*/, '') };
    
    if (msgStr.includes('[🤖 AUTO-REPLY]')) return { color: COLORS.cyan, icon: '🤖', module: 'AUTO-REPLY', text: msgStr.replace(/\[.*?\]\s*/, '') };
    if (msgStr.includes('[🧹 CLEANUP]')) return { color: COLORS.yellow, icon: '🧹', module: 'CLEANUP', text: msgStr.replace(/\[.*?\]\s*/, '') };
    if (msgStr.includes('[⚙️ BOOT]')) return { color: COLORS.white, icon: '⚙️', module: 'SYSTEM', text: msgStr.replace(/\[.*?\]\s*/, '') };
    if (msgStr.includes('[DATABASE]')) return { color: COLORS.yellow, icon: '💾', module: 'DATABASE', text: msgStr.replace(/\[.*?\]\s*/, '') };
    
    return { color: COLORS.white, icon: '💬', module: 'SYSTEM', text: msgStr };
}

console.log = function(...args) {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const msgStr = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    const f = formatMessage(msgStr);
    originalLog(`${COLORS.gray}[${time}]${COLORS.reset} ${f.color}${f.icon} [${f.module}]${COLORS.reset} ${f.text}`);
};

console.error = function(...args) {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const msgStr = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    const f = formatMessage(msgStr);
    originalError(`${COLORS.gray}[${time}]${COLORS.reset} ${COLORS.red}❌ [ERROR]${COLORS.reset} ${f.text}`);
};

// Custom Morgan untuk API Logs
app.use(morgan((tokens, req, res) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res);
    const responseTime = tokens['response-time'](req, res);
    
    let statusColor = status >= 500 ? COLORS.red : status >= 400 ? COLORS.yellow : COLORS.green;
    
    return `${COLORS.gray}[${time}]${COLORS.reset} ${COLORS.cyan}🌐 [API]${COLORS.reset} ${method} ${url} ${statusColor}${status}${COLORS.reset} - ${responseTime} ms`;
}));

// Middleware tambahan untuk mencegah req.body undefined jika client lupa set Content-Type
app.use((req, res, next) => {
    if (!req.body) req.body = {};
    next();
});

const PORT = process.env.PORT || 8000;
const MASTER_SECRET_KEY = process.env.MASTER_SECRET_KEY;

// Poin 3: Master Key Lock
if (!MASTER_SECRET_KEY || MASTER_SECRET_KEY === 'krisna_owner_secret') {
    console.error('\x1b[31m%s\x1b[0m', 'FATAL ERROR: MASTER_SECRET_KEY tidak ditemukan di .env atau masih menggunakan default. Sistem dimatikan demi keamanan.');
    process.exit(1);
}

const activeSessions = {};
const activeStores = {}; // Store untuk menampung data sinkronisasi WA (Contact, dll)
const userDeviceIndex = {}; // Untuk sistem Rotator (Round-Robin)

// Jalankan Queue Worker sebagai child process dengan Auto-Restart
let worker;
function startWorkerProcess() {
    worker = fork('./worker.js');
    worker.on('message', async (msg) => {
        if (msg.type === 'send_message') {
            const sock = activeSessions[msg.sender_device];
            if (sock) {
                try {
                    await sock.sendMessage(msg.recipient_jid, msg.payload);
                    worker.send({ type: 'send_result', id: msg.id, status: 'success', sender_device: msg.sender_device, recipient_jid: msg.recipient_jid, api_key_id: msg.api_key_id });
                } catch (err) {
                    worker.send({ type: 'send_result', id: msg.id, status: 'failed', error: err.message, sender_device: msg.sender_device, recipient_jid: msg.recipient_jid });
                }
            } else {
                worker.send({ type: 'send_result', id: msg.id, status: 'failed', error: 'Sesi pengirim tidak aktif.', sender_device: msg.sender_device, recipient_jid: msg.recipient_jid });
            }
        }
    });

    worker.on('exit', (code) => {
        console.error(`[QUEUE WORKER] Crashed/Exited dengan kode ${code}. Restarting dalam 3 detik...`);
        setTimeout(startWorkerProcess, 3000);
    });
}
startWorkerProcess();


// --- DAFTAR LIMIT PAKET & EXPIRATION (SaaS Tiers) ---
const PAKET_CONFIG = {
    'Free': { limit_pesan: 1000, max_devices: 1, expiry_days: 3 },
    'Lite': { limit_pesan: 10000, max_devices: 1, expiry_days: 30 },
    'Pro': { limit_pesan: 50000, max_devices: 3, expiry_days: 30 },
    'Premium': { limit_pesan: 500000, max_devices: 10, expiry_days: 30 }
};

const PAKET_RANK = { 'Free': 1, 'Lite': 2, 'Pro': 3, 'Premium': 4 };

// --- WEBHOOK SENDER ---
async function sendWebhook(url, payload, api_key_id) {
    if (!url) return null;
    try {
        const response = await axios.post(url, payload, { timeout: 5000 });
        console.log(`[WEBHOOK] Berhasil mengirim event ke ${url}`);
        return response.data;
    } catch (error) {
        console.error(`[WEBHOOK FAILED] Ke ${url}: ${error.message}`);
        if (api_key_id) {
            try {
                await prisma.webhookQueue.create({
                    data: { api_key_id, url, payload: JSON.stringify(payload) }
                });
                console.log(`[WEBHOOK] Dimasukkan ke Queue untuk dicoba ulang.`);
            } catch (dbErr) { console.error(`[WEBHOOK DB ERROR]`, dbErr.message); }
        }
        return null;
    }
}

// --- HELPER: FORMAT NOMOR HP ---
function formatNomorWhatsApp(nomor) {
    let clean = String(nomor).replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return clean;
}

// --- FUNGSI MENGHITUNG DEVICE AKTIF ---
async function countOwnedDevices(apiKey) {
    return await prisma.device.count({ where: { api_key_id: apiKey } });
}

// --- CORE FUNCTION: INISIALISASI SESI WHATSAPP DINAMIS ---
async function initWhatsAppSession(sessionId) {
    if (activeSessions[sessionId]) return activeSessions[sessionId];

    const { state, saveCreds } = await usePrismaAuthState(sessionId);
    
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        getMessage: async (key) => {
            return { conversation: 'hello' };
        },
        
        // --- PATCH ANTI-STUCK (KEEPALIVE) ---
        keepAliveIntervalMs: 10000,         // Ping server WA setiap 10 detik agar sesi tidak ditendang (stale)
        connectTimeoutMs: 60000,            // Timeout jika WA server tidak merespon
        defaultQueryTimeoutMs: 60000,       // Batas waktu proses query WA
        retryRequestDelayMs: 5000,          // Delay jika request gagal
        markOnlineOnConnect: true           // Memaksa status menjadi Online saat terkoneksi
    });

    const processContacts = async (contacts) => {
        try {
            for (let i = 0; i < contacts.length; i += 50) {
                const chunk = contacts.slice(i, i + 50);
                await Promise.all(chunk.map(contact => prisma.contactStore.upsert({
                    where: { nomor_device_contact_id: { nomor_device: sessionId, contact_id: contact.id } },
                    update: { name: contact.name, notify: contact.notify, verifiedName: contact.verifiedName },
                    create: { nomor_device: sessionId, contact_id: contact.id, name: contact.name, notify: contact.notify, verifiedName: contact.verifiedName }
                })));
            }
        } catch(e) {}
    };

    // Sync Contacts directly to Prisma (Batched & Async)
    sock.ev.on('contacts.upsert', async (contacts) => {
        processContacts(contacts);
    });
    
    sock.ev.on('messaging-history.set', async ({ contacts }) => {
        if (contacts) processContacts(contacts);
    });

    sock.ev.on('creds.update', saveCreds);

    const getDeviceData = async () => {
        if (global.deviceCache[sessionId]) return global.deviceCache[sessionId];
        try {
            const d = await prisma.device.findUnique({ where: { nomor_device: sessionId }, include: { apiKey: true } });
            if (d) {
                global.deviceCache[sessionId] = { is_autoread: d.is_autoread, webhook_url: d.apiKey?.webhook_url, api_key_id: d.api_key_id };
                return global.deviceCache[sessionId];
            }
        } catch (e) { return null; }
        return null;
    };

    // Event: Koneksi Update
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            global.io?.emit('device_status', { device: sessionId, status: 'WAITING_QR', qr: qr });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`[🔄 SESSION] Sesi ${sessionId} terputus. Reconnect: ${shouldReconnect}`);
            
            await prisma.device.update({ where: { nomor_device: sessionId }, data: { status: 'disconnected' } }).catch(() => {});
            global.io?.emit('device_status', { device: sessionId, status: 'DISCONNECTED' });

            if (shouldReconnect) {
                delete activeSessions[sessionId];
                const jitter = Math.floor(Math.random() * 6000) + 2000; // Delay acak 2-8 detik
                setTimeout(() => {
                    initWhatsAppSession(sessionId);
                }, jitter);
            } else {
                console.log(`[🗑️ SESSION] Sesi ${sessionId} Logout. Menghapus data...`);
                
                // Trigger Webhook Disconnected
                const device = await getDeviceData();
                if (device?.webhook_url) {
                    sendWebhook(device.webhook_url, { event: 'device.disconnected', device: sessionId }, device.api_key_id);
                }

                await prisma.authState.deleteMany({ where: { nomor_device: sessionId } }).catch(() => {});
                await prisma.contactStore.deleteMany({ where: { nomor_device: sessionId } }).catch(() => {});
                await prisma.device.delete({ where: { nomor_device: sessionId } }).catch(() => {});
                delete activeSessions[sessionId];
            }
        } else if (connection === 'open') {
            console.log(`[✅ SESSION] Sesi ${sessionId} TERHUBUNG & SIAP!`);
            await prisma.device.update({ where: { nomor_device: sessionId }, data: { status: 'connected' } }).catch(() => {});
            global.io?.emit('device_status', { device: sessionId, status: 'CONNECTED' });
        }
    });

    // Event: Pesan Masuk (Auto-Responder & Webhook)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (msg.key.fromMe) return;

        const senderJid = msg.key.remoteJid;
        if (senderJid.includes('@broadcast')) return; // Abaikan status WA

        // Ambil teks pesan (dari berbagai jenis format WA)
        const textMessage = msg.message?.conversation || 
                            msg.message?.extendedTextMessage?.text || 
                            msg.message?.imageMessage?.caption || "";

        const device = await getDeviceData();
        if (!device) return;

        // 1. AUTO-RESPONDER & INBOX LOGIC
        if (textMessage) {
            // Save to Inbox
            try {
                await prisma.messageInbox.create({
                    data: { nomor_device: sessionId, sender_jid: senderJid, message: textMessage }
                });
            } catch(e) {}

            let autoReplies = global.autoReplyCache[sessionId] || [];
            
            for (const reply of autoReplies) {
                let isMatch = false;
                if (reply.match_type === 'exact' && textMessage.trim().toLowerCase() === reply.keyword.toLowerCase()) {
                    isMatch = true;
                } else if (reply.match_type === 'contains' && textMessage.toLowerCase().includes(reply.keyword.toLowerCase())) {
                    isMatch = true;
                }

                if (isMatch) {
                    try {
                        if (reply.media_type && reply.media_url) {
                            if (reply.media_type === 'image') {
                                await sock.sendMessage(senderJid, { image: { url: reply.media_url }, caption: reply.response });
                            } else if (reply.media_type === 'video') {
                                await sock.sendMessage(senderJid, { video: { url: reply.media_url }, caption: reply.response });
                            } else if (reply.media_type === 'document') {
                                const fileName = reply.media_url.split('/').pop() || 'Document';
                                await sock.sendMessage(senderJid, { document: { url: reply.media_url }, mimetype: 'application/octet-stream', fileName, caption: reply.response });
                            } else if (reply.media_type === 'location') {
                                const [lat, long] = reply.media_url.split(',').map(s => parseFloat(s.trim()));
                                if (!isNaN(lat) && !isNaN(long)) {
                                    await sock.sendMessage(senderJid, { location: { degreesLatitude: lat, degreesLongitude: long } });
                                    if (reply.response) await sock.sendMessage(senderJid, { text: reply.response });
                                } else {
                                    await sock.sendMessage(senderJid, { text: reply.response });
                                }
                            } else {
                                await sock.sendMessage(senderJid, { text: reply.response });
                            }
                        } else {
                            await sock.sendMessage(senderJid, { text: reply.response });
                        }
                        console.log(`[🤖 AUTO-REPLY] Membalas ke ${senderJid} untuk keyword: ${reply.keyword}`);
                    } catch (e) {
                        console.error(`[AUTO-REPLY ERROR]`, e.message);
                    }
                    break; // Hanya balas 1 kata kunci pertama yang cocok
                }
            }
        }

        // 2. WEBHOOK TRIGGER & SYNCHRONOUS REPLY (NON-BLOCKING)
        if (device.webhook_url) {
            setImmediate(async () => {
                let base64Media = null;
                const isMedia = msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.documentMessage;
                
                if (isMedia) {
                    try {
                        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
                        const buffer = await downloadMediaMessage(
                            msg,
                            'buffer',
                            {},
                            { logger: pino({ level: 'silent' }) }
                        );
                        base64Media = buffer.toString('base64');
                    } catch (err) {
                        console.error('[WEBHOOK MEDIA ERROR] Gagal mengunduh media:', err.message);
                    }
                }

                const webhookResponse = await sendWebhook(device.webhook_url, {
                    event: 'message.received',
                    device: sessionId,
                    data: msg,
                    base64_media: base64Media
                }, device.api_key_id);
                
                if (webhookResponse && webhookResponse.reply) {
                    try {
                        await sock.sendMessage(senderJid, { text: webhookResponse.reply });
                        console.log(`[🤖 WEBHOOK-REPLY] Membalas instan ke ${senderJid}`);
                    } catch (e) {}
                }
            });
        }
        
        // 3. AUTO-READ (CENTANG BIRU)
        if (!msg.key.fromMe && device.is_autoread !== false) {
            try { await sock.readMessages([msg.key]); } catch(e) {}
        }
    });

    // Event: Status Pesan Berubah
    sock.ev.on('messages.update', async (updates) => {
        const device = await getDeviceData();
        if (device?.webhook_url) {
            for (const update of updates) {
                if (update.update.status) {
                    sendWebhook(device.webhook_url, {
                        event: 'message.status',
                        device: sessionId,
                        messageId: update.key.id,
                        status: update.update.status
                    }, device.api_key_id);
                }
            }
        }
    });

    activeSessions[sessionId] = sock;
    return sock;
}

// --- QUEUE WORKER HAS BEEN MOVED TO worker.js ---


// --- LOAD SESSIONS ON BOOT ---
async function loadSavedSessions() {
    // FIX STUCK QUEUE: Reset antrean yang nyangkut karena server crash
    await prisma.messageQueue.updateMany({
        where: { status: 'processing' },
        data: { status: 'pending' }
    });

    const devices = await prisma.device.findMany({ include: { apiKey: true, autoReplies: true } });
    for (const dev of devices) {
        console.log(`[⚙️ BOOT] Memulihkan: ${dev.nomor_device}`);
        global.deviceCache[dev.nomor_device] = { 
            is_autoread: dev.is_autoread, 
            webhook_url: dev.apiKey?.webhook_url,
            api_key_id: dev.api_key_id
        };
        global.autoReplyCache[dev.nomor_device] = dev.autoReplies || [];
        initWhatsAppSession(dev.nomor_device);
    }
}

// --- AUTO DATA PRUNING (CLEANUP) ---
setInterval(async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const resQueue = await prisma.messageQueue.deleteMany({
            where: { status: { in: ['sent', 'failed'] }, createdAt: { lt: thirtyDaysAgo } }
        });
        const resInbox = await prisma.messageInbox.deleteMany({
            where: { createdAt: { lt: thirtyDaysAgo } }
        });
        const resWebhook = await prisma.webhookQueue.deleteMany({
            where: { status: { in: ['success', 'failed'] }, createdAt: { lt: thirtyDaysAgo } }
        });

        console.log(`[🧹 CLEANUP] Menghapus data > 30 hari: ${resQueue.count} Queue, ${resInbox.count} Inbox, ${resWebhook.count} Webhook.`);
    } catch (e) {
        console.error('[🧹 CLEANUP ERROR] Gagal menghapus data lama:', e.message);
    }
}, 24 * 60 * 60 * 1000); // Berjalan setiap 24 jam

// --- MIDDLEWARES ---
const validateMasterKey = (req, res, next) => {
    const masterKey = req.headers['x-master-key'] || req.query.masterkey || req.body.masterkey;
    if (masterKey !== MASTER_SECRET_KEY) return res.status(401).json({ status: false, message: 'Akses ditolak. Master Key salah.' });
    next();
};

const validateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apikey || req.body.apikey;
    if (!apiKey) return res.status(401).json({ status: false, message: 'API Key dibutuhkan.' });

    // Poin 4: Validasi Hash API Key
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyData = await prisma.apiKey.findUnique({ where: { key: hashedKey } });
    if (!keyData || keyData.status !== 'active') return res.status(403).json({ status: false, message: 'API Key tidak valid atau tidak aktif.' });

    if (new Date() > new Date(keyData.expired_at)) {
        await prisma.apiKey.update({ where: { key: hashedKey }, data: { status: 'expired' } });
        return res.status(403).json({ status: false, message: 'API Key telah kedaluwarsa. Silakan perpanjang.' });
    }

    req.apiKeyData = keyData;
    next();
};

const checkQuotaMiddleware = async (req, res, next) => {
    const user = req.apiKeyData;
    if (user.terpakai_bulan_ini >= user.limit_pesan && user.paket !== 'Premium') {
        return res.status(402).json({ status: false, message: 'Kuota pesan Anda habis. Silakan upgrade.' });
    }
    next();
};

const validateDeviceOwnership = async (req, res, next) => {
    const user = req.apiKeyData;
    let rawSender = req.headers['sender_id'] || req.query.sender_id || req.body.sender_id;
    let sender_id = rawSender ? formatNomorWhatsApp(rawSender) : '';
    
    let isOwner;
    if (sender_id) {
        isOwner = await prisma.device.findFirst({ where: { nomor_device: sender_id, api_key_id: user.key } });
    }
    
    // Fallback: Jika sender_id tidak ada atau tidak valid, jalankan logika Rotator (Round-Robin)
    if (!isOwner) {
        const userDevices = await prisma.device.findMany({ 
            where: { api_key_id: user.key, status: 'connected' },
            orderBy: { id: 'asc' }
        });
        
        if (userDevices.length > 0) {
            if (userDeviceIndex[user.key] === undefined) userDeviceIndex[user.key] = 0;
            
            let currentIndex = userDeviceIndex[user.key];
            if (currentIndex >= userDevices.length) currentIndex = 0;
            
            sender_id = userDevices[currentIndex].nomor_device;
            isOwner = true; // Rotator berhasil memilih device
            
            userDeviceIndex[user.key] = currentIndex + 1; // Increment giliran
        } else {
            // Jika tidak ada yang connected, fallback ke semua device (meskipun disconnected, agar masuk queue)
            const allUserDevices = await prisma.device.findMany({ where: { api_key_id: user.key } });
            if (allUserDevices.length > 0) {
                 isOwner = true;
                 sender_id = allUserDevices[0].nomor_device;
            }
        }
    }

    if (!isOwner) return res.status(403).json({ status: false, message: 'Nomor pengirim bukan milik Anda atau Anda belum mendaftarkan device.' });
    
    req.cleanSender = sender_id;
    next();
}

// ==========================================
//          UPTIMEROBOT PING ENDPOINT
// ==========================================
app.get('/ping', (req, res) => {
    res.status(200).json({ status: true, message: 'WA Gateway Enterprise is online.', timestamp: new Date() });
});

// ==========================================
//          ENDPOINT MANAJEMEN API KEY
// ==========================================
// Admin: Melihat semua API Key
app.get('/api-key/list', validateMasterKey, async (req, res) => {
    try {
        const keys = await prisma.apiKey.findMany({ orderBy: { key: 'desc' } });
        return res.status(200).json({ status: true, data: keys });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/api-key/generate', validateMasterKey, async (req, res) => {
    try {
        const { paket = 'Free', label = 'User', expiry_days } = req.body;
        if (!PAKET_CONFIG[paket]) return res.status(400).json({ status: false, message: 'Paket tidak valid.' });

        const config = PAKET_CONFIG[paket];
        const finalExpiryDays = expiry_days ? parseInt(expiry_days) : config.expiry_days;
        const plainKey = 'KEY-' + crypto.randomBytes(16).toString('hex').toUpperCase();
        
        // Poin 4: Hashing API Key
        const hashedKey = crypto.createHash('sha256').update(plainKey).digest('hex');

        const now = new Date();
        const expiredAt = new Date(now);
        expiredAt.setDate(now.getDate() + finalExpiryDays);

        const keyData = await prisma.apiKey.create({
            data: {
                key: hashedKey, label: label, paket: paket, limit_pesan: config.limit_pesan, max_devices: config.max_devices,
                terpakai_bulan_ini: 0, last_reset_month: now.toISOString().substring(0, 7), expired_at: expiredAt
            }
        });
        return res.status(201).json({ status: true, message: `API Key ${paket} berhasil dibuat.`, plain_key: plainKey, data: keyData });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/api-key/extend', validateMasterKey, async (req, res) => {
    try {
        const { target_api_key, tambah_hari } = req.body;
        if (!target_api_key || !tambah_hari) return res.status(400).json({ status: false, message: 'Parameter tidak lengkap.' });
        
        const hashedTargetKey = crypto.createHash('sha256').update(target_api_key).digest('hex');
        const currentUser = await prisma.apiKey.findUnique({ where: { key: hashedTargetKey } });
        if (!currentUser) return res.status(404).json({ status: false, message: 'API Key tidak ditemukan.' });

        const now = new Date();
        let currentExpiry = new Date(currentUser.expired_at);
        if (currentExpiry < now) currentExpiry = now; // Jika sudah kedaluwarsa, mulai dari hari ini
        
        currentExpiry.setDate(currentExpiry.getDate() + parseInt(tambah_hari));
        
        const updated = await prisma.apiKey.update({
            where: { key: hashedTargetKey },
            data: { expired_at: currentExpiry, status: 'active' } // Pastikan status aktif kembali
        });
        
        return res.status(200).json({ status: true, message: `Masa aktif berhasil diperpanjang ${tambah_hari} hari.`, data: updated });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/api-key/upgrade', validateMasterKey, async (req, res) => {
    try {
        const { target_api_key, nama_paket } = req.body;
        if (!target_api_key || !nama_paket) return res.status(400).json({ status: false, message: 'Parameter tidak lengkap.' });
        if (!PAKET_CONFIG[nama_paket]) return res.status(400).json({ status: false, message: 'Nama paket salah!' });

        const hashedTargetKey = crypto.createHash('sha256').update(target_api_key).digest('hex');
        const currentUser = await prisma.apiKey.findUnique({ where: { key: hashedTargetKey } });
        if (!currentUser) return res.status(404).json({ status: false, message: 'API Key tidak ditemukan.' });

        if (PAKET_RANK[nama_paket] < PAKET_RANK[currentUser.paket]) {
            return res.status(400).json({ status: false, message: 'Tidak bisa downgrade ke paket yang lebih rendah.' });
        }

        const config = PAKET_CONFIG[nama_paket];
        const now = new Date();
        const expiredAt = new Date(now);
        expiredAt.setDate(now.getDate() + config.expiry_days);

        const updated = await prisma.apiKey.update({
            where: { key: hashedTargetKey },
            data: { paket: nama_paket, limit_pesan: config.limit_pesan, max_devices: config.max_devices, terpakai_bulan_ini: 0, status: 'active', expired_at: expiredAt }
        });
        return res.status(200).json({ status: true, message: `Sukses di-upgrade ke ${nama_paket}`, data: updated });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/webhook/set', validateApiKey, async (req, res) => {
    try {
        const { webhook_url } = req.body;
        const updated = await prisma.apiKey.update({ where: { key: req.apiKeyData.key }, data: { webhook_url: webhook_url || null } });
        return res.status(200).json({ status: true, message: 'URL Webhook berhasil diperbarui.', data: updated });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// User: Cek status, kuota, paket dan masa aktif API Key saat ini
app.get('/api-key/info', validateApiKey, async (req, res) => {
    try {
        // req.apiKeyData sudah diekstrak oleh middleware validateApiKey
        // namun kita hilangkan properti yang tidak perlu jika diinginkan, atau kirim semuanya.
        return res.status(200).json({ 
            status: true, 
            data: req.apiKeyData 
        });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// ==========================================
//           ENDPOINT DEVICE / SAAS
// ==========================================
// Admin: Melihat semua device di sistem
app.get('/device/all', validateMasterKey, async (req, res) => {
    try {
        const devices = await prisma.device.findMany({ orderBy: { id: 'desc' } });
        return res.status(200).json({ status: true, data: devices });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// User: Melihat device miliknya
app.get('/device/list', validateApiKey, async (req, res) => {
    try {
        const devices = await prisma.device.findMany({ where: { api_key_id: req.apiKeyData.key } });
        return res.status(200).json({ status: true, data: devices });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/device/add', validateApiKey, async (req, res) => {
    const { nomor_device } = req.body;
    if (!nomor_device) return res.status(400).json({ status: false, message: 'Parameter nomor_device wajib diisi.' });

    const cleanDevice = formatNomorWhatsApp(nomor_device);
    const user = req.apiKeyData;

    try {
        const existingDevice = await prisma.device.findUnique({ where: { nomor_device: cleanDevice } });
        if (!existingDevice) {
            const currentCount = await countOwnedDevices(user.key);
            if (currentCount >= user.max_devices) return res.status(403).json({ status: false, message: `Slot device penuh (${currentCount}/${user.max_devices}).` });
            await prisma.device.create({ data: { nomor_device: cleanDevice, api_key_id: user.key } });
        } else if (existingDevice.api_key_id !== user.key) {
            return res.status(403).json({ status: false, message: 'Nomor device ini sudah dipakai oleh API Key lain.' });
        }

        const sock = await initWhatsAppSession(cleanDevice);
        if (sock.authState.creds.registered) return res.status(200).json({ status: true, message: 'Terhubung.', device_status: 'CONNECTED' });

        // Delay 3 detik agar WebSocket Baileys siap menerima pairing request
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        let pairingCode = await sock.requestPairingCode(cleanDevice);
        global.io?.emit('device_status', { device: cleanDevice, status: 'WAITING_PAIRING', code: pairingCode });
        return res.status(200).json({ status: true, message: 'Silakan masukkan kode pairing ini di WhatsApp.', pairing_code: pairingCode, device_status: 'WAITING_PAIRING' });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/device/delete', validateApiKey, validateDeviceOwnership, async (req, res) => {
    const sock = activeSessions[req.cleanSender];
    try {
        if (sock) {
            await sock.logout(); // Memicu event connection.update "close" dengan "loggedOut"
        } else {
            // Jika tidak ada aktif di RAM, hapus paksa file dan DB
            await prisma.device.delete({ where: { nomor_device: req.cleanSender } }).catch(() => {});
        }
        return res.status(200).json({ status: true, message: `Device ${req.cleanSender} berhasil dihapus dan dilogout.` });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.get('/group/list', validateApiKey, validateDeviceOwnership, async (req, res) => {
    const sock = activeSessions[req.cleanSender];
    if (!sock) return res.status(404).json({ status: false, message: 'Sesi perangkat tidak aktif' });
    try {
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups).map(g => ({ id: g.id, subject: g.subject, participants: g.participants.length }));
        return res.status(200).json({ status: true, data: groupList });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.get('/contact/list', validateApiKey, validateDeviceOwnership, async (req, res) => {
    const store = activeStores[req.cleanSender];
    if (!store) return res.status(404).json({ status: false, message: 'Store kontak untuk perangkat tidak ditemukan atau sesi belum siap.' });
    
    try {
        const contacts = Object.values(store.contacts).map(c => ({
            id: c.id,
            name: c.name || c.notify || c.verifiedName || 'Unknown'
        }));
        return res.status(200).json({ status: true, data: contacts });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.get('/inbox', validateApiKey, async (req, res) => {
    try {
        const user = req.apiKeyData;
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        
        let deviceFilter = {};
        // Opsional: Filter berdasarkan 1 nomor spesifik
        if (req.query.sender_id || req.query.device) {
             const cleanDevice = formatNomorWhatsApp(req.query.sender_id || req.query.device);
             const isOwner = await prisma.device.findFirst({ where: { nomor_device: cleanDevice, api_key_id: user.key }});
             if (!isOwner) return res.status(403).json({ status: false, message: 'Nomor pengirim bukan milik Anda.' });
             deviceFilter = { nomor_device: cleanDevice };
        } else {
             // Secara default, tarik inbox dari SELURUH nomor yang dimiliki oleh API Key ini
             const userDevices = await prisma.device.findMany({ where: { api_key_id: user.key }, select: { nomor_device: true }});
             deviceFilter = { nomor_device: { in: userDevices.map(d => d.nomor_device) } };
        }

        const messages = await prisma.messageInbox.findMany({
            where: deviceFilter,
            orderBy: { createdAt: 'desc' },
            take: limit > 500 ? 500 : limit, // Maksimal 500
            skip: skip
        });
        
        const total = await prisma.messageInbox.count({ where: deviceFilter });

        return res.status(200).json({ 
            status: true, 
            data: messages,
            pagination: { page, limit, total }
        });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// ==========================================
//          ENDPOINT QUEUE (ANTREAN PESAN)
// ==========================================
// Admin: Melihat semua antrean (paginated)
app.get('/queue/all', validateMasterKey, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const queues = await prisma.messageQueue.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip
        });
        const total = await prisma.messageQueue.count();
        return res.status(200).json({ status: true, data: queues, pagination: { page, limit, total } });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// User: Melihat antrean miliknya (paginated)
app.get('/queue/my', validateApiKey, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const queues = await prisma.messageQueue.findMany({
            where: { api_key_id: req.apiKeyData.key },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip
        });
        const total = await prisma.messageQueue.count({ where: { api_key_id: req.apiKeyData.key } });
        return res.status(200).json({ status: true, data: queues, pagination: { page, limit, total } });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// User: Membatalkan/Menghapus antrean (Kill Switch)
app.post('/queue/cancel', validateApiKey, async (req, res) => {
    try {
        const user = req.apiKeyData;
        const { device } = req.body; // Opsional
        
        let filter = { api_key_id: user.key, status: 'pending' };
        if (device) {
            filter.sender_device = formatNomorWhatsApp(device);
        }
        
        const deleted = await prisma.messageQueue.deleteMany({ where: filter });
        return res.status(200).json({ 
            status: true, 
            message: `Berhasil membatalkan dan menghapus ${deleted.count} antrean pesan yang berstatus pending.` 
        });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// ==========================================
//          WEBHOOK & DEVICE SETTINGS
// ==========================================
app.post('/webhook/set', validateApiKey, async (req, res) => {
    const { webhook_url } = req.body;
    const user = req.apiKeyData;
    try {
        await prisma.apiKey.update({ where: { key: user.key }, data: { webhook_url: webhook_url || null } });
        // Sinkronisasi Cache
        for (const device in global.deviceCache) {
            if (global.deviceCache[device].api_key_id === user.key) {
                global.deviceCache[device].webhook_url = webhook_url || null;
            }
        }
        return res.status(200).json({ status: true, message: 'Webhook URL berhasil diperbarui.' });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/device/settings', validateApiKey, validateDeviceOwnership, async (req, res) => {
    const { is_autoread } = req.body;
    try {
        if (typeof is_autoread !== 'boolean') return res.status(400).json({ status: false, message: 'is_autoread harus boolean (true/false).' });
        await prisma.device.update({ where: { nomor_device: req.cleanSender }, data: { is_autoread } });
        if (global.deviceCache[req.cleanSender]) {
            global.deviceCache[req.cleanSender].is_autoread = is_autoread;
        }
        return res.status(200).json({ status: true, message: 'Pengaturan perangkat berhasil diperbarui.' });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// ==========================================
//          AUTO-RESPONDER (CHATBOT)
// ==========================================
app.post('/auto-reply/add', validateApiKey, validateDeviceOwnership, async (req, res) => {
    const { keyword, response, match_type = 'exact', media_url, media_type } = req.body;
    if (!keyword || !response) return res.status(400).json({ status: false, message: 'Keyword dan response wajib diisi.' });
    try {
        const reply = await prisma.autoReply.create({
            data: { keyword, response, match_type, media_url, media_type, nomor_device: req.cleanSender }
        });
        if (!global.autoReplyCache[req.cleanSender]) global.autoReplyCache[req.cleanSender] = [];
        global.autoReplyCache[req.cleanSender].push(reply);
        return res.status(201).json({ status: true, message: 'Auto-reply ditambahkan.', data: reply });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.get('/auto-reply/list', validateApiKey, validateDeviceOwnership, async (req, res) => {
    try {
        const replies = await prisma.autoReply.findMany({ where: { nomor_device: req.cleanSender } });
        return res.status(200).json({ status: true, data: replies });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/auto-reply/delete', validateApiKey, validateDeviceOwnership, async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ status: false, message: 'Parameter ID wajib.' });
    try {
        const reply = await prisma.autoReply.findFirst({ where: { id: parseInt(id), nomor_device: req.cleanSender } });
        if (!reply) return res.status(404).json({ status: false, message: 'Data tidak ditemukan atau bukan milik device ini.' });
        await prisma.autoReply.delete({ where: { id: parseInt(id) } });
        if (global.autoReplyCache[req.cleanSender]) {
            global.autoReplyCache[req.cleanSender] = global.autoReplyCache[req.cleanSender].filter(r => r.id !== parseInt(id));
        }
        return res.status(200).json({ status: true, message: 'Berhasil dihapus.' });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

// ==========================================
//          ENDPOINT KIRIM PESAN & MEDIA
// ==========================================
// Helper function to insert into Database Queue
async function addToQueue(req, res, recipient_jid, payload) {
    try {
        let sendAt = new Date();
        if (req.body.send_at) { // Dukungan Penjadwalan
            const formats = [
                "dddd, DD MMMM YYYY HH:mm", // Jumat, 17 Juni 2026 15:00
                "dddd, DD MMMM YYYY",       // Jumat, 17 Juni 2026
                "dddd, DD-MM-YYYY HH:mm",   // Jumat, 17-06-2026 15:00
                "dddd, DD-MM-YYYY",         // Jumat, 17-06-2026
                "DD MMMM YYYY HH:mm",       // 17 Juni 2026 15:00
                "DD MMMM YYYY",             // 17 Juni 2026
                "DD-MM-YYYY HH:mm",         // 17-06-2026 15:00
                "DD-MM-YYYY",               // 17-06-2026
                "YYYY-MM-DD HH:mm",         // 2026-06-17 15:00
                "YYYY-MM-DD"                // 2026-06-17
            ];
            
            const parsed = moment(req.body.send_at, formats, 'id', true);
            if (parsed.isValid()) {
                sendAt = parsed.toDate();
            } else {
                const looseParsed = moment(req.body.send_at, formats, 'id');
                if (looseParsed.isValid()) sendAt = looseParsed.toDate();
            }
        }
        await prisma.messageQueue.create({
            data: {
                sender_device: req.cleanSender,
                recipient_jid: recipient_jid,
                payload: JSON.stringify(payload),
                send_at: sendAt,
                api_key_id: req.apiKeyData.key
            }
        });
        
        // Kalkulasi Sisa Kuota
        const user = await prisma.apiKey.findUnique({ where: { key: req.apiKeyData.key } });
        const sisaKuota = user.limit_pesan - user.terpakai_bulan_ini - 1; // -1 untuk pesan yang barusan masuk antrean
        const realKuota = sisaKuota < 0 ? 0 : sisaKuota;

        return res.status(200).json({ 
            status: true, 
            message: 'Pesan telah dimasukkan ke dalam antrean (Database Queue).',
            sisa_kuota: user.paket === 'Premium' ? 'UNLIMITED' : realKuota
        });
    } catch (error) { console.error('[API ERROR]', error.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
}

app.post('/kirim-pesan', validateApiKey, validateDeviceOwnership, checkQuotaMiddleware, async (req, res) => {
    const { nomor, pesan, media_url, media_type } = req.body;
    if (!nomor) return res.status(400).json({ status: false, message: 'Parameter nomor wajib.' });
    const jid = `${formatNomorWhatsApp(nomor)}@s.whatsapp.net`;
    
    let payload = { text: pesan || '' };
    if (media_url) {
        const tipe = media_type || 'image';
        if (tipe === 'image') payload = { image: { url: media_url }, caption: pesan || '' };
        else if (tipe === 'video') payload = { video: { url: media_url }, caption: pesan || '' };
        else if (tipe === 'document') payload = { document: { url: media_url }, mimetype: 'application/pdf', fileName: pesan || 'document.pdf' };
    } else if (!pesan) {
        return res.status(400).json({ status: false, message: 'Parameter pesan wajib jika tidak mengirim media.' });
    }
    
    return addToQueue(req, res, jid, payload);
});

app.post('/kirim-massal', validateApiKey, validateDeviceOwnership, checkQuotaMiddleware, async (req, res) => {
    const { pesan_list } = req.body; // Array of {nomor, pesan, media_url, media_type}
    if (!pesan_list || !Array.isArray(pesan_list)) return res.status(400).json({ status: false, message: 'Format salah. Butuh array pesan_list.' });
    
    const user = req.apiKeyData;
    if (user.paket !== 'Premium' && (user.terpakai_bulan_ini + pesan_list.length) > user.limit_pesan) {
         return res.status(402).json({ status: false, message: 'Kuota pesan Anda tidak cukup untuk broadcast massal ini.' });
    }

    let sendAt = new Date();
    if (req.body.send_at) { // Dukungan Penjadwalan Broadcast Massal
        const formats = [
            "dddd, DD MMMM YYYY HH:mm", "dddd, DD MMMM YYYY",
            "dddd, DD-MM-YYYY HH:mm", "dddd, DD-MM-YYYY",
            "DD MMMM YYYY HH:mm", "DD MMMM YYYY",
            "DD-MM-YYYY HH:mm", "DD-MM-YYYY",
            "YYYY-MM-DD HH:mm", "YYYY-MM-DD"
        ];
        const parsed = moment(req.body.send_at, formats, 'id', true);
        if (parsed.isValid()) {
            sendAt = parsed.toDate();
        } else {
            const looseParsed = moment(req.body.send_at, formats, 'id');
            if (looseParsed.isValid()) sendAt = looseParsed.toDate();
        }
    }

    try {
        const queueData = pesan_list.map(item => {
             let payloadObj = { text: item.pesan || '' };
             if (item.media_url) {
                 const tipe = item.media_type || 'image';
                 if (tipe === 'image') payloadObj = { image: { url: item.media_url }, caption: item.pesan || '' };
                 else if (tipe === 'video') payloadObj = { video: { url: item.media_url }, caption: item.pesan || '' };
                 else if (tipe === 'document') payloadObj = { document: { url: item.media_url }, mimetype: 'application/pdf', fileName: item.pesan || 'document.pdf' };
             }
             return {
                 sender_device: req.cleanSender,
                 recipient_jid: `${formatNomorWhatsApp(item.nomor)}@s.whatsapp.net`,
                 payload: JSON.stringify(payloadObj),
                 send_at: sendAt,
                 api_key_id: user.key
             };
        });
        
        await prisma.messageQueue.createMany({ data: queueData });
        return res.status(200).json({ status: true, message: `${pesan_list.length} pesan berhasil diantrekan secara massal.`});
    } catch(err) { console.error('[API ERROR]', err.message); return res.status(500).json({ status: false, message: 'Terjadi kesalahan internal pada server.' }); }
});

app.post('/kirim-grup', validateApiKey, validateDeviceOwnership, checkQuotaMiddleware, async (req, res) => {
    const { group_id, pesan } = req.body; // group_id = misal 123456789@g.us
    if (!group_id || !pesan) return res.status(400).json({ status: false, message: 'Parameter group_id & pesan wajib.' });
    return addToQueue(req, res, group_id, { text: pesan });
});

app.post('/kirim-lokasi', validateApiKey, validateDeviceOwnership, checkQuotaMiddleware, async (req, res) => {
    const { nomor, lat, long } = req.body;
    if (!nomor || !lat || !long) return res.status(400).json({ status: false, message: 'Parameter nomor, lat, long wajib.' });
    const jid = `${formatNomorWhatsApp(nomor)}@s.whatsapp.net`;
    return addToQueue(req, res, jid, { location: { degreesLatitude: parseFloat(lat), degreesLongitude: parseFloat(long) } });
});

app.post('/kirim-polling', validateApiKey, validateDeviceOwnership, checkQuotaMiddleware, async (req, res) => {
    const { nomor, nama_polling, opsi, multiple_choice = false } = req.body;
    if (!nomor || !nama_polling || !opsi || !Array.isArray(opsi)) return res.status(400).json({ status: false, message: 'Parameter tidak valid. Opsi harus berupa array.' });
    const jid = `${formatNomorWhatsApp(nomor)}@s.whatsapp.net`;
    return addToQueue(req, res, jid, {
        poll: {
            name: nama_polling,
            values: opsi,
            selectableCount: multiple_choice ? 0 : 1
        }
    });
});

app.post('/kirim-media', validateApiKey, validateDeviceOwnership, checkQuotaMiddleware, async (req, res) => {
    const { nomor, url, tipe, caption = '' } = req.body; // tipe = image, video, document
    if (!nomor || !url || !tipe) return res.status(400).json({ status: false, message: 'Parameter nomor, url, dan tipe wajib.' });
    
    try {
        const headRes = await axios.head(url, { timeout: 5000 });
        const contentLength = headRes.headers['content-length'];
        if (contentLength && parseInt(contentLength) > 15 * 1024 * 1024) { // 15MB limit
            return res.status(400).json({ status: false, message: 'Ukuran file media terlalu besar. Maksimal 15MB.' });
        }
    } catch (e) {
        return res.status(400).json({ status: false, message: 'URL media tidak dapat diakses atau tidak valid.' });
    }

    const jid = `${formatNomorWhatsApp(nomor)}@s.whatsapp.net`;
    let payload = {};
    if (tipe === 'image') payload = { image: { url }, caption };
    else if (tipe === 'video') payload = { video: { url }, caption };
    else if (tipe === 'document') payload = { document: { url }, mimetype: 'application/pdf', fileName: caption || 'document.pdf' };
    else return res.status(400).json({ status: false, message: 'Tipe media harus image, video, atau document.' });

    return addToQueue(req, res, jid, payload);
});

app.post('/kirim-vcard', validateApiKey, validateDeviceOwnership, checkQuotaMiddleware, async (req, res) => {
    const { nomor, nama_kontak, nomor_kontak } = req.body;
    if (!nomor || !nama_kontak || !nomor_kontak) return res.status(400).json({ status: false, message: 'Parameter wajib.' });
    
    const jid = `${formatNomorWhatsApp(nomor)}@s.whatsapp.net`;
    const cleanContact = formatNomorWhatsApp(nomor_kontak);
    const vcard = 'BEGIN:VCARD\n' 
                + 'VERSION:3.0\n' 
                + `FN:${nama_kontak}\n` 
                + `TEL;type=CELL;type=VOICE;waid=${cleanContact}:+${cleanContact}\n` 
                + 'END:VCARD';

    return addToQueue(req, res, jid, {
        contacts: { displayName: nama_kontak, contacts: [{ vcard }] }
    });
});

// --- EXECUTE ON STARTUP ---
server.listen(PORT, async () => {
    console.log('\n\x1b[36m%s\x1b[0m', '██╗  ██╗██████╗ ██╗███████╗███╗   ██╗ █████╗ ');
    console.log('\x1b[36m%s\x1b[0m', '██║ ██╔╝██╔══██╗██║██╔════╝████╗  ██║██╔══██╗');
    console.log('\x1b[36m%s\x1b[0m', '█████╔╝ ██████╔╝██║███████╗██╔██╗ ██║███████║');
    console.log('\x1b[36m%s\x1b[0m', '██╔═██╗ ██╔══██╗██║╚════██║██║╚██╗██║██╔══██║');
    console.log('\x1b[36m%s\x1b[0m', '██║  ██╗██║  ██║██║███████║██║ ╚████║██║  ██║');
    console.log('\x1b[36m%s\x1b[0m', '╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝');
    console.log('\x1b[33m%s\x1b[0m', '===================================================');
    console.log('\x1b[32m%s\x1b[0m', `🚀 KRISNA GATEWAY (API Server) Berjalan di Port: ${PORT}`);
    console.log('\x1b[33m%s\x1b[0m', '===================================================\n');
    
    // Resume worker & check connected sessions
    await loadSavedSessions();
    
    // AUTO CLEANUP INBOX (Hapus pesan yang umurnya > 30 Hari)
    setInterval(async () => {
        try {
            const date30DaysAgo = new Date();
            date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
            const deleted = await prisma.messageInbox.deleteMany({
                where: { createdAt: { lt: date30DaysAgo } }
            });
            if (deleted.count > 0) console.log(`[🧹 CLEANUP] Menghapus ${deleted.count} pesan inbox lawas.`);
        } catch(e) {}
    }, 24 * 60 * 60 * 1000); // Jalan setiap 24 Jam
});

