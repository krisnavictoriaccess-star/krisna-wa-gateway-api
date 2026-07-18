const fs = require('fs');

const swagger = {
  openapi: "3.0.0",
  info: {
    title: "Gateway API Enterprise",
    version: "2.0.0",
    description: "Integrasikan sistem Anda dengan WhatsApp Gateway kelas Enterprise. Dilengkapi fitur Rotator, Spintax, dan Auto-Read."
  },
  servers: [
    { url: "https://api.krisnamarket.my.id", description: "Production Server" },
    { url: "http://localhost:8000", description: "Local Server" }
  ],
  components: {
    securitySchemes: {
      MasterKeyAuth: { type: "apiKey", in: "header", name: "x-master-key", description: "Kunci rahasia master dari file .env VPS." },
      ApiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key", description: "Token API klien berlangganan." }
    }
  },
  tags: [
    { name: "Admin (Master Key)", description: "Endpoint khusus manajemen API Key (Membutuhkan x-master-key)" },
    { name: "Device Management", description: "Pengaturan perangkat WhatsApp klien (Membutuhkan x-api-key)" },
    { name: "Messaging", description: "Pengiriman pesan teks, media, polling, dll (Membutuhkan x-api-key)" },
    { name: "Webhooks & Chatbot", description: "Pengaturan Webhook dan Auto-Reply (Membutuhkan x-api-key)" },
    { name: "Data & Queue", description: "Menarik data antrean, pesan masuk, kontak, dan grup (Membutuhkan x-api-key)" }
  ],
  paths: {
    // ADMIN ROUTES
    "/api-key/all": {
      get: { tags: ["Admin (Master Key)"], summary: "Daftar Semua API Key", security: [{ MasterKeyAuth: [] }], responses: { "200": { description: "Sukses" } } }
    },
    "/api-key/generate": {
      post: { 
        tags: ["Admin (Master Key)"], summary: "Generate API Key", security: [{ MasterKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { paket: { type: "string", default: "Free" }, label: { type: "string", default: "User" }, expiry_days: { type: "integer" } } } } } },
        responses: { "201": { description: "Created" } }
      }
    },
    "/api-key/extend": {
      post: {
        tags: ["Admin (Master Key)"], summary: "Extend API Key", security: [{ MasterKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["target_api_key", "tambah_hari"], properties: { target_api_key: { type: "string" }, tambah_hari: { type: "integer" } } } } } },
        responses: { "200": { description: "Sukses" } }
      }
    },
    "/api-key/upgrade": {
      post: {
        tags: ["Admin (Master Key)"], summary: "Upgrade API Key", security: [{ MasterKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["target_api_key", "nama_paket"], properties: { target_api_key: { type: "string" }, nama_paket: { type: "string" } } } } } },
        responses: { "200": { description: "Sukses" } }
      }
    },
    "/device/all": {
      get: { tags: ["Admin (Master Key)"], summary: "Daftar Semua Devices di Server", security: [{ MasterKeyAuth: [] }], responses: { "200": { description: "Sukses" } } }
    },

    // DEVICE MANAGEMENT
    "/device/create": {
      post: {
        tags: ["Device Management"], summary: "Buat Sesi Perangkat Baru (Pairing Code)", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor_hp"], properties: { nomor_hp: { type: "string", example: "62812xxx" } } } } } },
        responses: { "201": { description: "Sukses, mengembalikan Pairing Code" } }
      }
    },
    "/device/delete": {
      post: {
        tags: ["Device Management"], summary: "Hapus Sesi Perangkat", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor_device"], properties: { nomor_device: { type: "string", example: "62812xxx" } } } } } },
        responses: { "200": { description: "Sukses menghapus sesi" } }
      }
    },
    "/device/list": {
      get: { tags: ["Device Management"], summary: "Daftar Perangkat Milik Klien", security: [{ ApiKeyAuth: [] }], responses: { "200": { description: "Daftar Device" } } }
    },
    "/device/settings": {
      post: {
        tags: ["Device Management"], summary: "Ubah Pengaturan Perangkat (Auto-Read)", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor_device", "is_autoread"], properties: { nomor_device: { type: "string", example: "62812xxx" }, is_autoread: { type: "boolean", default: true } } } } } },
        responses: { "200": { description: "Pengaturan tersimpan" } }
      }
    },

    // MESSAGING
    "/message/send": {
      post: {
        tags: ["Messaging"], summary: "Kirim Pesan Teks", security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: "sender_id", in: "header", description: "Nomor pengirim (Opsional, gunakan Rotator jika kosong)", required: false, schema: { type: "string" } }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor", "pesan"], properties: { nomor: { type: "string", example: "62812xxx" }, pesan: { type: "string", example: "Halo dari API!" } } } } } },
        responses: { "200": { description: "Terkirim atau Masuk Antrean" } }
      }
    },
    "/message/send-massal": {
      post: {
        tags: ["Messaging"], summary: "Kirim Pesan Massal (Broadcast / Spintax)", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["data"], properties: { data: { type: "array", items: { type: "object", properties: { nomor: { type: "string" }, pesan: { type: "string" } } } }, delay_ms: { type: "integer", default: 2000 } } } } } },
        responses: { "200": { description: "Broadcast dimasukkan ke antrean" } }
      }
    },
    "/message/send-group": {
      post: {
        tags: ["Messaging"], summary: "Kirim Pesan ke Grup", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["group_id", "pesan"], properties: { sender_id: { type: "string" }, group_id: { type: "string", example: "12345678@g.us" }, pesan: { type: "string" } } } } } },
        responses: { "200": { description: "Terkirim" } }
      }
    },
    "/message/send-media": {
      post: {
        tags: ["Messaging"], summary: "Kirim Gambar / Video / Dokumen", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor", "media_url", "media_type"], properties: { sender_id: { type: "string" }, nomor: { type: "string" }, media_url: { type: "string" }, media_type: { type: "string", example: "image" }, caption: { type: "string" } } } } } },
        responses: { "200": { description: "Terkirim" } }
      }
    },
    "/message/send-poll": {
      post: {
        tags: ["Messaging"], summary: "Kirim Polling (Voting)", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor", "name", "values"], properties: { sender_id: { type: "string" }, nomor: { type: "string" }, name: { type: "string", example: "Berapa umur Anda?" }, values: { type: "array", items: { type: "string" }, example: ["18-25", "26-35"] }, selectableCount: { type: "integer", default: 1 } } } } } },
        responses: { "200": { description: "Terkirim" } }
      }
    },
    "/message/send-vcard": {
      post: {
        tags: ["Messaging"], summary: "Kirim Kontak (VCard)", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor", "contact_name", "contact_number"], properties: { sender_id: { type: "string" }, nomor: { type: "string" }, contact_name: { type: "string", example: "John Doe" }, contact_number: { type: "string", example: "62812xxx" } } } } } },
        responses: { "200": { description: "Terkirim" } }
      }
    },
    "/message/send-location": {
      post: {
        tags: ["Messaging"], summary: "Kirim Lokasi (GPS)", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor", "lat", "long"], properties: { sender_id: { type: "string" }, nomor: { type: "string" }, lat: { type: "number", example: -6.200000 }, long: { type: "number", example: 106.816666 }, name: { type: "string" }, address: { type: "string" } } } } } },
        responses: { "200": { description: "Terkirim" } }
      }
    },

    // WEBHOOKS & CHATBOT
    "/webhook/set": {
      post: {
        tags: ["Webhooks & Chatbot"], summary: "Atur URL Webhook", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { webhook_url: { type: "string", example: "https://webhook.site/xxx" } } } } } },
        responses: { "200": { description: "Tersimpan" } }
      }
    },
    "/autoreply/create": {
      post: {
        tags: ["Webhooks & Chatbot"], summary: "Buat Auto-Reply Baru", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["nomor_device", "keyword", "response"], properties: { nomor_device: { type: "string" }, keyword: { type: "string", example: "ping" }, response: { type: "string", example: "pong!" }, match_type: { type: "string", example: "exact" }, media_url: { type: "string" }, media_type: { type: "string" } } } } } },
        responses: { "201": { description: "Tersimpan" } }
      }
    },
    "/autoreply/delete": {
      post: {
        tags: ["Webhooks & Chatbot"], summary: "Hapus Auto-Reply", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["id_autoreply"], properties: { id_autoreply: { type: "integer" } } } } } },
        responses: { "200": { description: "Dihapus" } }
      }
    },

    // DATA & QUEUE
    "/inbox/list": {
      get: {
        tags: ["Data & Queue"], summary: "Ambil Kotak Masuk", security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: "nomor_device", in: "query", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Daftar pesan masuk" } }
      }
    },
    "/queue/list": {
      get: { tags: ["Data & Queue"], summary: "Lihat Status Antrean Pesan", security: [{ ApiKeyAuth: [] }], responses: { "200": { description: "Status antrean" } } }
    },
    "/queue/cancel": {
      post: {
        tags: ["Data & Queue"], summary: "Batalkan Antrean (Pending)", security: [{ ApiKeyAuth: [] }],
        requestBody: { content: { "application/json": { schema: { type: "object", required: ["queue_id"], properties: { queue_id: { type: "integer" } } } } } },
        responses: { "200": { description: "Dibatalkan" } }
      }
    },
    "/contact/list": {
      get: {
        tags: ["Data & Queue"], summary: "Ambil Buku Kontak Perangkat", security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: "nomor_device", in: "query", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Daftar Kontak" } }
      }
    },
    "/group/list": {
      get: {
        tags: ["Data & Queue"], summary: "Ambil Daftar Grup", security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: "nomor_device", in: "query", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Daftar Grup" } }
      }
    }
  }
};

fs.writeFileSync('docs/swagger.json', JSON.stringify(swagger, null, 2));
console.log('swagger.json generated successfully!');
