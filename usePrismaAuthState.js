const { BufferJSON, initAuthCreds } = require('@whiskeysockets/baileys');

const usePrismaAuthState = async (sessionId, prisma) => {
    // 5-Second Memory Buffer
    let writeBuffer = new Map();
    let writeTimeout = null;

    const flushWriteBuffer = async () => {
        if (writeBuffer.size === 0) return;
        
        // Clone and clear the buffer quickly to avoid race conditions
        const currentBuffer = new Map(writeBuffer);
        writeBuffer.clear();
        
        const tasks = [];
        for (const [key, value] of currentBuffer.entries()) {
            if (value === null) {
                tasks.push(() => prisma.authState.delete({
                    where: { nomor_device_key: { nomor_device: sessionId, key } }
                }).catch(() => {}));
            } else {
                tasks.push(() => prisma.authState.upsert({
                    where: { nomor_device_key: { nomor_device: sessionId, key } },
                    update: { value },
                    create: { nomor_device: sessionId, key, value }
                }).catch((error) => {
                    if (error.code !== 'P2002') {
                        console.error('\x1b[31m%s\x1b[0m', `[AUTH STATE ERROR] Write failed for ${key}: ${error.message}`);
                    }
                }));
            }
        }
        
        try {
            // Execute sequentially to prevent MySQL Deadlocks and "Lock wait timeout exceeded"
            for (const executeTask of tasks) {
                await executeTask();
            }
        } catch(e) {
            console.error('\x1b[31m%s\x1b[0m', '[AUTH STATE ERROR] Flush error: ' + e.message);
        }
    };

    const queueWrite = (key, data) => {
        const value = data ? JSON.stringify(data, BufferJSON.replacer) : null;
        writeBuffer.set(key, value);
        
        if (writeTimeout) clearTimeout(writeTimeout);
        writeTimeout = setTimeout(flushWriteBuffer, 5000); // 5 Detik Jeda (Debounce)
    };

    const readData = async (key) => {
        // Serve from RAM if it's currently waiting in the buffer
        if (writeBuffer.has(key)) {
            const buffered = writeBuffer.get(key);
            if (buffered === null) return null;
            return JSON.parse(buffered, BufferJSON.reviver);
        }

        try {
            const data = await prisma.authState.findUnique({
                where: {
                    nomor_device_key: {
                        nomor_device: sessionId,
                        key: key
                    }
                }
            });
            if (data && data.value) {
                return JSON.parse(data.value, BufferJSON.reviver);
            }
            return null;
        } catch (error) {
            // console.error('Error reading auth state from DB', error);
            return null;
        }
    };

    const creds = (await readData('creds')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = Buffer.from(value.data || value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            queueWrite(key, value);
                        }
                    }
                }
            }
        },
        saveCreds: () => {
            queueWrite('creds', creds);
        }
    };
};

module.exports = { usePrismaAuthState };
