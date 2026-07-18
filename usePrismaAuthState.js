const { BufferJSON, initAuthCreds } = require('@whiskeysockets/baileys');

const usePrismaAuthState = async (sessionId, prisma) => {
    const writeData = async (data, key) => {
        const value = JSON.stringify(data, BufferJSON.replacer);
            try {
                await prisma.authState.upsert({
                    where: {
                        nomor_device_key: {
                            nomor_device: sessionId,
                            key: key
                        }
                    },
                    update: { value },
                    create: {
                        nomor_device: sessionId,
                        key: key,
                        value: value
                    }
                });
            } catch (error) {
                if (error.code !== 'P2002') {
                    console.error('[AUTH STATE ERROR] Write failed:', error.message);
                }
            }
    };

    const readData = async (key) => {
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
            console.error('Error reading auth state from DB', error);
            return null;
        }
    };

    const removeData = async (key) => {
        try {
            await prisma.authState.delete({
                where: {
                        nomor_device_key: {
                            nomor_device: sessionId,
                            key: key
                        }
                    }
                });
        } catch (error) {
            // Ignore if not found
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
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, 'creds');
        }
    };
};

module.exports = { usePrismaAuthState };
