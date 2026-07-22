const fs = require('fs');
const path = require('path');

const endpoints = [
    // ----------------------------------------------------
    // MASTER ENDPOINTS (x-master-key)
    // ----------------------------------------------------
    {
        category: "👑 Master (Admin Only)",
        method: "GET", path: "/package/list",
        summary: "Melihat daftar semua paket langganan yang tersedia di database.",
        badge: "master",
        params: [],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": [
    {
      "id": 1,
      "nama_paket": "Free",
      "deskripsi": "Paket Gratis",
      "harga": "0",
      "limit_pesan": 1000,
      "limit_device": 1,
      "limit_autoreply": 5,
      "fitur_broadcast": false,
      "fitur_media": false,
      "fitur_group": false,
      "fitur_webhook": false,
      "fitur_vcard": false,
      "fitur_lokasi": false,
      "fitur_polling": false,
      "fitur_contact_list": false,
      "fitur_group_list": false,
      "fitur_inbox": false,
      "is_public": true,
      "createdAt": "2026-07-22T00:00:00.000Z",
      "updatedAt": "2026-07-22T00:00:00.000Z"
    }
  ]
}`,
        resError: `{ "status": false, "message": "Invalid master key" }`
    },
    {
        method: "POST", path: "/package/add",
        summary: "Menambahkan paket layanan baru ke dalam sistem.",
        badge: "master",
        params: [
            { field: "nama_paket", type: "String", status: "wajib", desc: "Nama unik untuk paket (contoh: 'Premium', 'VIP')." },
            { field: "deskripsi", type: "String", status: "opsional", desc: "Deskripsi fitur paket." },
            { field: "harga", type: "String", status: "opsional", desc: "Harga paket (contoh: '50000')." },
            { field: "limit_pesan", type: "Integer", status: "opsional", desc: "Batas pesan per bulan. Default: 1000." },
            { field: "limit_device", type: "Integer", status: "opsional", desc: "Jumlah WhatsApp yang bisa dikoneksikan. Default: 1." },
            { field: "limit_autoreply", type: "Integer", status: "opsional", desc: "Batas jumlah auto-reply. Default: 5." },
            { field: "fitur_broadcast", type: "Boolean", status: "opsional", desc: "Aktifkan fitur kirim pesan massal? Default: false." },
            { field: "fitur_media", type: "Boolean", status: "opsional", desc: "Aktifkan kirim gambar/video/dokumen? Default: false." },
            { field: "fitur_group", type: "Boolean", status: "opsional", desc: "Aktifkan kirim pesan ke grup? Default: false." },
            { field: "fitur_webhook", type: "Boolean", status: "opsional", desc: "Aktifkan Webhook URL? Default: false." },
            { field: "fitur_vcard", type: "Boolean", status: "opsional", desc: "Aktifkan kirim kontak (vCard)? Default: false." },
            { field: "fitur_lokasi", type: "Boolean", status: "opsional", desc: "Aktifkan kirim koordinat lokasi? Default: false." },
            { field: "fitur_polling", type: "Boolean", status: "opsional", desc: "Aktifkan pembuatan polling (vote)? Default: false." },
            { field: "fitur_contact_list", type: "Boolean", status: "opsional", desc: "Aktifkan tarik kontak perangkat? Default: false." },
            { field: "fitur_group_list", type: "Boolean", status: "opsional", desc: "Aktifkan tarik grup perangkat? Default: false." },
            { field: "fitur_inbox", type: "Boolean", status: "opsional", desc: "Aktifkan penyimpanan riwayat pesan masuk? Default: false." },
            { field: "is_public", type: "Boolean", status: "opsional", desc: "true = Bisa dibeli umum. false = Paket rahasia/internal. Default: true." }
        ],
        reqBody: `{
  "nama_paket": "Premium VIP",
  "deskripsi": "Paket tanpa batas untuk pengusaha",
  "harga": "150000",
  "limit_pesan": 99999,
  "limit_device": 5,
  "limit_autoreply": 100,
  "fitur_broadcast": true,
  "fitur_media": true,
  "fitur_group": true,
  "fitur_webhook": true,
  "fitur_vcard": true,
  "fitur_lokasi": true,
  "fitur_polling": true,
  "fitur_contact_list": true,
  "fitur_group_list": true,
  "fitur_inbox": true,
  "is_public": true
}`,
        resSuccess: `{
  "status": true,
  "message": "Paket berhasil dibuat",
  "data": { "id": 2, "nama_paket": "Premium VIP", "..." : "..." }
}`,
        resError: `{ "status": false, "message": "nama_paket wajib diisi." }`
    },
    {
        method: "POST", path: "/package/edit",
        summary: "Mengubah spesifikasi dan fitur dari paket yang sudah ada.",
        badge: "master",
        params: [
            { field: "id", type: "Integer", status: "wajib", desc: "ID paket yang ingin diubah." },
            { field: "...", type: "Campuran", status: "opsional", desc: "Kirimkan HANYA field yang ingin diubah (contoh: harga, is_public, dll)." }
        ],
        reqBody: `{
  "id": 2,
  "harga": "200000",
  "limit_device": 10,
  "is_public": false
}`,
        resSuccess: `{
  "status": true,
  "message": "Paket berhasil diubah",
  "data": { "id": 2, "harga": "200000", "..." : "..." }
}`,
        resError: `{ "status": false, "message": "id paket wajib diisi." }`
    },
    {
        method: "POST", path: "/package/delete",
        summary: "Menghapus paket secara permanen dari database.",
        badge: "master",
        params: [
            { field: "id", type: "Integer", status: "wajib", desc: "ID paket yang ingin dihapus." }
        ],
        reqBody: `{
  "id": 2
}`,
        resSuccess: `{
  "status": true,
  "message": "Paket berhasil dihapus permanen dari database.",
  "data": { "id": 2, "nama_paket": "Premium VIP" }
}`,
        resError: `{ "status": false, "message": "Record to delete does not exist." }`
    },
    {
        method: "POST", path: "/api-key/generate",
        summary: "Membuat (Generate) API Key baru untuk user/klien.",
        badge: "master",
        params: [
            { field: "paket", type: "String", status: "opsional", desc: "Nama paket yang diberikan ke user. Default: 'Free'." },
            { field: "label", type: "String", status: "opsional", desc: "Nama/Keterangan pemilik API Key. Default: 'User'." },
            { field: "expiry_days", type: "Integer", status: "opsional", desc: "Masa aktif API Key dalam hitungan hari. Default: 30." }
        ],
        reqBody: `{
  "paket": "Premium VIP",
  "label": "PT. Sukses Makmur",
  "expiry_days": 365
}`,
        resSuccess: `{
  "status": true,
  "message": "API Key berhasil digenerate",
  "data": {
    "key": "KEY-A1B2C3D4E5F67890",
    "paket": "Premium VIP",
    "label": "PT. Sukses Makmur",
    "expired_at": "2027-07-22T00:00:00.000Z"
  }
}`,
        resError: `{ "status": false, "message": "Paket tidak valid atau tidak ditemukan di database." }`
    },
    {
        method: "GET", path: "/api-key/list",
        summary: "Melihat daftar semua API Key klien beserta sisa masa aktifnya.",
        badge: "master",
        params: [],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": [
    {
      "key": "hashed_key_xyz",
      "label": "User Biasa",
      "package": "Free",
      "expiredAt": "2026-08-20T00:00:00.000Z"
    }
  ]
}`,
        resError: `{ "status": false, "message": "Invalid master key" }`
    },
    {
        method: "POST", path: "/api-key/extend",
        summary: "Memperpanjang masa aktif API Key yang sudah ada.",
        badge: "master",
        params: [
            { field: "target_api_key", type: "String", status: "wajib", desc: "API Key (Plain Text) milik klien yang ingin diperpanjang." },
            { field: "tambah_hari", type: "Integer", status: "wajib", desc: "Jumlah hari tambahan masa aktif." }
        ],
        reqBody: `{
  "target_api_key": "KEY-A1B2C3D4E5F67890",
  "tambah_hari": 30
}`,
        resSuccess: `{
  "status": true,
  "message": "Masa aktif API Key berhasil diperpanjang.",
  "data": { "expiredAt": "2027-08-20T00:00:00.000Z" }
}`,
        resError: `{ "status": false, "message": "API Key tidak valid." }`
    },
    {
        method: "POST", path: "/api-key/upgrade",
        summary: "Menaikkan atau menurunkan jenis paket (Upgrade/Downgrade) pada API Key klien.",
        badge: "master",
        params: [
            { field: "target_api_key", type: "String", status: "wajib", desc: "API Key klien (Plain Text)." },
            { field: "nama_paket", type: "String", status: "wajib", desc: "Nama paket baru yang ingin diberikan." }
        ],
        reqBody: `{
  "target_api_key": "KEY-A1B2C3D4E5F67890",
  "nama_paket": "Premium VIP"
}`,
        resSuccess: `{
  "status": true,
  "message": "Paket API Key berhasil di-upgrade/downgrade.",
  "data": { "package": "Premium VIP" }
}`,
        resError: `{ "status": false, "message": "Paket tidak ditemukan." }`
    },
    {
        method: "POST", path: "/api-key/delete",
        summary: "Menghapus (Mencabut) akses API Key klien secara permanen.",
        badge: "master",
        params: [
            { field: "target_api_key", type: "String", status: "wajib", desc: "API Key (Plain text) klien yang ingin dihapus." }
        ],
        reqBody: `{
  "target_api_key": "KEY-A1B2C3D4E5F67890"
}`,
        resSuccess: `{
  "status": true,
  "message": "API Key berhasil dihapus dari database."
}`,
        resError: `{ "status": false, "message": "API Key tidak valid atau sudah terhapus." }`
    },
    
    // ----------------------------------------------------
    // USER ENDPOINTS (x-api-key)
    // ----------------------------------------------------
    {
        category: "👤 Info Akun",
        method: "GET", path: "/api-key/info",
        summary: "Melihat informasi API Key Anda sendiri (Paket, Kuota, Masa Aktif).",
        badge: "user",
        params: [],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": {
    "label": "PT. Sukses Makmur",
    "package": "Premium VIP",
    "expiredAt": "2026-12-31T23:59:59.000Z",
    "features": {
      "limit_device": 5,
      "limit_pesan": 99999,
      "fitur_broadcast": true
    }
  }
}`,
        resError: `{ "status": false, "message": "API Key tidak valid atau expired." }`
    },
    {
        category: "📱 Manajemen Perangkat (Device)",
        method: "GET", path: "/device/list",
        summary: "Mendapatkan daftar nomor WhatsApp yang terhubung ke API Key Anda.",
        badge: "user",
        params: [],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": [
    {
      "nomor": "628123456789",
      "status": "CONNECTED",
      "webhook_url": "https://domain.com/webhook",
      "autoreply_active": true
    }
  ]
}`,
        resError: `{ "status": false, "message": "Invalid API Key" }`
    },
    {
        method: "POST", path: "/device/connect",
        summary: "Meminta Pairing Code untuk menghubungkan nomor WhatsApp baru.",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor WhatsApp yang akan dihubungkan (format: 628xxx)." }
        ],
        reqBody: `{
  "nomor": "628123456789"
}`,
        resSuccess: `{
  "status": true,
  "message": "Menunggu koneksi dari perangkat.",
  "code": "X7K9Y2M4"
}`,
        resError: `{ "status": false, "message": "Batas device tercapai. Upgrade paket Anda." }`
    },
    {
        method: "POST", path: "/device/disconnect",
        summary: "Memutuskan koneksi dan menghapus sesi WhatsApp.",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor WhatsApp yang akan diputus." }
        ],
        reqBody: `{
  "nomor": "628123456789"
}`,
        resSuccess: `{
  "status": true,
  "message": "Device 628123456789 berhasil diputuskan dan dihapus."
}`,
        resError: `{ "status": false, "message": "Device tidak ditemukan." }`
    },
    {
        method: "POST", path: "/device/webhook",
        summary: "Mengatur atau menghapus Webhook URL untuk perangkat spesifik.",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor perangkat Anda." },
            { field: "webhook_url", type: "String", status: "opsional", desc: "URL Webhook. Kosongkan body ini jika ingin menghapus webhook." }
        ],
        reqBody: `{
  "nomor": "628123456789",
  "webhook_url": "https://domainanda.com/api/wa-webhook"
}`,
        resSuccess: `{
  "status": true,
  "message": "Webhook berhasil diatur."
}`,
        resError: `{ "status": false, "message": "Paket Anda tidak memiliki izin untuk menggunakan Webhook." }`
    },

    {
        category: "💬 Messaging (Pengiriman)",
        method: "POST", path: "/kirim-pesan",
        summary: "Mengirim pesan teks ke satu nomor.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "opsional", desc: "Nomor pengirim di HTTP Header. Kosongkan untuk mode Rotator." },
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan (628xxx)." },
            { field: "pesan", type: "String", status: "wajib", desc: "Isi pesan teks." }
        ],
        reqBody: `{
  "nomor": "628999999999",
  "pesan": "Halo bosku, invoice bulan ini sudah terbit!"
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil dimasukkan ke antrean pengiriman.",
  "queue_id": 150
}`,
        resError: `{ "status": false, "message": "Parameter nomor dan pesan wajib." }`
    },
    {
        method: "POST", path: "/kirim-media",
        summary: "Mengirim gambar, video, atau dokumen PDF.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "opsional", desc: "Nomor pengirim di HTTP Header. Kosongkan untuk Rotator." },
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan (628xxx)." },
            { field: "url", type: "String", status: "wajib", desc: "Tautan/URL langsung ke file media (maks 15MB)." },
            { field: "tipe", type: "String", status: "wajib", desc: "Tipe media: 'image', 'video', atau 'document'." },
            { field: "caption", type: "String", status: "opsional", desc: "Keterangan teks di bawah media. (Untuk document, ini menjadi nama file pdf)." }
        ],
        reqBody: `{
  "nomor": "628999999999",
  "url": "https://domain.com/brosur.jpg",
  "tipe": "image",
  "caption": "Silakan cek promo terbaru kami!"
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil dimasukkan ke antrean pengiriman.",
  "queue_id": 151
}`,
        resError: `{ "status": false, "message": "Parameter nomor, url, dan tipe wajib." }`
    },
    {
        method: "POST", path: "/kirim-grup",
        summary: "Mengirim pesan teks ke Grup WhatsApp.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Wajib diisi karena pengirim harus menjadi anggota grup." },
            { field: "group_id", type: "String", status: "wajib", desc: "ID Grup (Berakhiran @g.us)." },
            { field: "pesan", type: "String", status: "wajib", desc: "Isi pesan teks." }
        ],
        reqBody: `{
  "group_id": "120363045678901234@g.us",
  "pesan": "Selamat pagi rekan-rekan semua!"
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil dimasukkan ke antrean pengiriman."
}`,
        resError: `{ "status": false, "message": "Paket Anda tidak memiliki izin untuk mengirim ke Grup." }`
    },
    {
        method: "POST", path: "/kirim-polling",
        summary: "Mengirim Polling (Vote) interaktif.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "opsional", desc: "Nomor pengirim." },
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan (628xxx)." },
            { field: "name", type: "String", status: "wajib", desc: "Pertanyaan polling." },
            { field: "values", type: "Array of String", status: "wajib", desc: "Pilihan jawaban (minimal 2, maksimal 12)." },
            { field: "selectableCount", type: "Integer", status: "opsional", desc: "Berapa banyak pilihan yang bisa dipilih user. Default: 1." }
        ],
        reqBody: `{
  "nomor": "628999999999",
  "name": "Kapan jadwal meeting selanjutnya?",
  "values": ["Senin Pagi", "Selasa Siang", "Jumat Sore"],
  "selectableCount": 1
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil dimasukkan ke antrean pengiriman."
}`,
        resError: `{ "status": false, "message": "Pilihan polling minimal 2 dan maksimal 12." }`
    },
    {
        method: "POST", path: "/kirim-lokasi",
        summary: "Mengirim titik koordinat (Location).",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "opsional", desc: "Nomor pengirim." },
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan (628xxx)." },
            { field: "latitude", type: "Float", status: "wajib", desc: "Garis lintang." },
            { field: "longitude", type: "Float", status: "wajib", desc: "Garis bujur." }
        ],
        reqBody: `{
  "nomor": "628999999999",
  "latitude": -6.200000,
  "longitude": 106.816666
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil dimasukkan ke antrean pengiriman."
}`,
        resError: `{ "status": false, "message": "Latitude dan longitude wajib diisi." }`
    },
    {
        method: "POST", path: "/kirim-vcard",
        summary: "Mengirim kartu kontak (vCard).",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "opsional", desc: "Nomor pengirim." },
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan (628xxx)." },
            { field: "contact_name", type: "String", status: "wajib", desc: "Nama kontak yang akan dikirim." },
            { field: "contact_phone", type: "String", status: "wajib", desc: "Nomor telepon kontak yang akan dikirim." }
        ],
        reqBody: `{
  "nomor": "628999999999",
  "contact_name": "CS Support Kami",
  "contact_phone": "+628123456789"
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil dimasukkan ke antrean pengiriman."
}`,
        resError: `{ "status": false, "message": "contact_name dan contact_phone wajib." }`
    },
    {
        method: "POST", path: "/kirim-massal",
        summary: "Mengirim pesan teks secara massal (Broadcast).",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "opsional", desc: "Nomor pengirim." },
            { field: "targets", type: "Array of String", status: "wajib", desc: "Daftar nomor tujuan." },
            { field: "pesan", type: "String", status: "wajib", desc: "Isi pesan. Mendukung tag {nama} jika list ditarik dari contact list." },
            { field: "delay_ms", type: "Integer", status: "opsional", desc: "Jeda per pengiriman dalam milidetik. Sangat direkomendasikan untuk menghindari pemblokiran. Default: 5000 (5 detik)." }
        ],
        reqBody: `{
  "targets": ["628111111111", "628222222222"],
  "pesan": "Info penting: Sistem maintenance malam ini.",
  "delay_ms": 7000
}`,
        resSuccess: `{
  "status": true,
  "message": "2 pesan berhasil dimasukkan ke antrean massal."
}`,
        resError: `{ "status": false, "message": "Paket Anda tidak memiliki izin untuk fitur Broadcast." }`
    },

    {
        category: "🤖 Auto-Reply",
        method: "GET", path: "/auto-reply/list",
        summary: "Melihat daftar Auto-Reply yang Anda buat.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Wajib untuk mengetahui data device mana yang ingin dilihat." }
        ],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": [
    {
      "id": 1,
      "keyword": "PING",
      "response": "PONG! Bot Aktif.",
      "is_exact": true
    }
  ]
}`,
        resError: `{ "status": false, "message": "Header sender_id wajib diisi." }`
    },
    {
        method: "POST", path: "/auto-reply/add",
        summary: "Menambahkan aturan Auto-Reply baru.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor perangkat Anda." },
            { field: "keyword", type: "String", status: "wajib", desc: "Kata kunci pemicu balasan." },
            { field: "response", type: "String", status: "wajib", desc: "Teks balasan otomatis." },
            { field: "is_exact", type: "Boolean", status: "opsional", desc: "true = Harus persis sama (PING == PING). false = Cukup mengandung kata (PING == halo PING pagi). Default: true." }
        ],
        reqBody: `{
  "keyword": "harga",
  "response": "Berikut adalah daftar harga kami:\n1. Paket A: Rp100.000",
  "is_exact": false
}`,
        resSuccess: `{
  "status": true,
  "message": "Auto-reply berhasil ditambahkan."
}`,
        resError: `{ "status": false, "message": "Batas auto-reply tercapai." }`
    },
    {
        method: "POST", path: "/auto-reply/delete",
        summary: "Menghapus aturan Auto-Reply.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor perangkat Anda." },
            { field: "id", type: "Integer", status: "wajib", desc: "ID dari auto-reply yang ingin dihapus." }
        ],
        reqBody: `{
  "id": 1
}`,
        resSuccess: `{
  "status": true,
  "message": "Auto-reply berhasil dihapus."
}`,
        resError: `{ "status": false, "message": "Auto-reply tidak ditemukan." }`
    },
    {
        method: "POST", path: "/auto-reply/toggle",
        summary: "Menyalakan/mematikan fitur Auto-Reply secara global untuk device.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor perangkat." },
            { field: "active", type: "Boolean", status: "wajib", desc: "true = Nyala. false = Mati." }
        ],
        reqBody: `{
  "active": false
}`,
        resSuccess: `{
  "status": true,
  "message": "Status auto-reply diperbarui."
}`,
        resError: `{ "status": false, "message": "Device tidak ditemukan." }`
    },

    {
        category: "📇 Ekstraksi Data (Tarik Data)",
        method: "GET", path: "/contacts",
        summary: "Tarik daftar kontak yang tersimpan di HP/Device.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor perangkat." }
        ],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": [
    { "id": "6281234@s.whatsapp.net", "name": "Budi Santoso", "number": "6281234" }
  ]
}`,
        resError: `{ "status": false, "message": "Paket tidak mendukung tarik kontak." }`
    },
    {
        method: "GET", path: "/groups",
        summary: "Tarik daftar Grup di mana Device bergabung.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor perangkat." }
        ],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": [
    { "id": "123456@g.us", "subject": "Grup Alumni HMI", "participantsCount": 42 }
  ]
}`,
        resError: `{ "status": false, "message": "Paket tidak mendukung tarik grup." }`
    },
    {
        method: "GET", path: "/inbox",
        summary: "Melihat riwayat pesan masuk ke Device (jika fitur_inbox aktif).",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor perangkat." },
            { field: "limit", type: "Integer", status: "opsional", desc: "Jumlah pesan yang ingin diambil (URL Query '?limit=50'). Default 50." }
        ],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "data": [
    { "from": "628999@s.whatsapp.net", "message": "Halo, barang ready?", "timestamp": "2026-07-22T10:00:00" }
  ]
}`,
        resError: `{ "status": false, "message": "Paket tidak mendukung Inbox." }`
    },

    {
        category: "🚦 Manajemen Antrean (Queue)",
        method: "GET", path: "/queue/my",
        summary: "Melihat statistik antrean pengiriman pesan Anda saat ini.",
        badge: "user",
        params: [
            { field: "device", type: "String", status: "opsional", desc: "URL Query '?device=628xxx' untuk filter antrean device tertentu." }
        ],
        reqBody: "",
        resSuccess: `{
  "status": true,
  "pending": 5,
  "success": 250,
  "failed": 2
}`,
        resError: `{ "status": false, "message": "Gagal memuat antrean." }`
    },
    {
        method: "POST", path: "/queue/cancel",
        summary: "Membatalkan seluruh pesan di antrean yang belum terkirim.",
        badge: "user",
        params: [
            { field: "device", type: "String", status: "opsional", desc: "Nomor pengirim jika ingin membatalkan antrean spesifik." }
        ],
        reqBody: `{
  "device": "628123456789"
}`,
        resSuccess: `{
  "status": true,
  "message": "Antrean berhasil dibatalkan."
}`,
        resError: `{ "status": false, "message": "Gagal membatalkan antrean." }`
    }
];

// --- NATIVE JS HTML GENERATION ---
let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krisna WA Gateway - Dokumentasi API</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
    </style>
</head>
<body class="bg-slate-900 text-slate-300 font-sans antialiased overflow-x-hidden">
<div class="flex flex-col md:flex-row max-w-[1600px] mx-auto min-h-screen relative w-full">

<!-- Mobile Hamburger -->
<div class="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
    <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">K</div>
        <div class="font-bold text-slate-200">API Docs</div>
    </div>
    <button id="mobileMenuBtn" class="text-slate-300 focus:outline-none p-2 rounded hover:bg-slate-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
    </button>
</div>

<!-- Sidebar -->
<aside id="sidebar" class="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-800/80 p-5 h-screen overflow-y-auto shrink-0 bg-slate-900 absolute md:sticky top-0 left-0 z-50 transition-all">
  <div class="mb-8 px-2 hidden md:flex items-center gap-3">
    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">K</div>
    <h2 class="text-lg font-bold text-slate-200 tracking-tight">API Docs</h2>
  </div>
  
  <button data-tab="top" class="tab-link link-top block w-full text-left px-3 py-2 mb-4 text-sm rounded-lg transition-colors font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800/50">🏠 Beranda / Pengantar</button>
`;

let currentCategory = "";
endpoints.forEach(ep => {
    if (ep.category && ep.category !== currentCategory) {
        html += `\n  <div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">${ep.category}</div>`;
        currentCategory = ep.category;
    }
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');
    let badgeColor = ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                     (ep.method === 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20');
                     
    html += `\n  <button data-tab="${epId}" class="tab-link link-${epId} block w-full text-left px-2 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50">
    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold border ${badgeColor} w-10 text-center shrink-0">${ep.method}</span>
    <span class="truncate">${ep.path}</span>
  </button>`;
});

html += `
  <div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Events</div>
  <button data-tab="websocket" class="tab-link link-websocket block w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800/50">⚡ WebSockets</button>
  <div class="h-10 shrink-0"></div>
</aside>
<div id="sidebarOverlay" class="hidden fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"></div>

<main class="flex-1 p-5 md:p-8 lg:p-12 w-full min-w-0 overflow-x-hidden relative">
    <header class="mb-10 md:mb-12 border-b border-slate-800/80 pb-6 md:pb-8 mt-2 md:mt-0">
      <h1 class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-3 md:mb-4 tracking-tight">Krisna WA Gateway API</h1>
      <p class="text-slate-400 text-sm md:text-lg">Referensi Lengkap Integrasi Gateway Enterprise</p>
    </header>

    <!-- Top Tab -->
    <div id="tab-top" class="tab-content hidden">
      <div class="bg-blue-900/10 border border-blue-800/40 rounded-2xl p-5 md:p-8 mb-8 shadow-xl shadow-black/20 overflow-hidden">
         <h3 class="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">🌍 Base URL</h3>
         <div class="relative group">
             <div class="overflow-x-auto bg-black/60 p-4 md:p-5 rounded-xl border border-slate-800 shadow-inner">
                 <code id="code-baseurl" class="text-amber-400 font-mono text-sm md:text-lg whitespace-nowrap">https://api.krisnadev.my.id</code>
             </div>
             <button data-copy="code-baseurl" class="copy-btn absolute top-1/2 -translate-y-1/2 right-3 bg-slate-700 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
         </div>
      </div>
      
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 md:p-8 shadow-xl shadow-black/20 overflow-hidden">
         <h3 class="text-slate-200 font-bold mb-3 flex items-center gap-2 text-lg">🔐 Autentikasi (Headers)</h3>
         <p class="text-slate-400 mb-5 text-sm md:text-base">Selalu sertakan kredensial di header HTTP (bukan di URL parameter).</p>
         <div class="overflow-x-auto rounded-xl border border-slate-700/60 shadow-inner w-full">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-800 text-slate-300">
                <tr><th class="px-5 py-3 font-semibold">Header</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 font-semibold">Deskripsi</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-master-key</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Wajib (Admin)</span></td>
                  <td class="px-5 py-4 text-slate-400">Untuk akses endpoint master.</td>
                </tr>
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-api-key</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Wajib (Klien)</span></td>
                  <td class="px-5 py-4 text-slate-400">Token klien yang didapat dari Generate.</td>
                </tr>
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">sender_id</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Opsional</span></td>
                  <td class="px-5 py-4 text-slate-400">Pilih nomor pengirim spesifik. Kosong = Rotator.</td>
                </tr>
              </tbody>
            </table>
         </div>
      </div>
    </div>
    
    <!-- WebSocket Tab -->
    <div id="tab-websocket" class="tab-content hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10">
      <div class="p-5 md:p-8">
        <h3 class="text-2xl font-bold text-slate-200 mb-6 pb-3 border-b border-slate-800">⚡ WebSockets</h3>
        <p class="text-slate-400 mb-4 text-sm md:text-base">API ini menyediakan WebSocket untuk memantau status sesi perangkat (Koneksi WA) secara *real-time*.</p>
        <div class="overflow-x-auto bg-black/50 p-5 rounded-xl border border-slate-700/50 shadow-inner mb-6 relative group">
           <div class="flex flex-wrap items-center gap-2 mb-3">
               <span class="bg-blue-600/30 text-blue-400 px-2 py-1 rounded text-xs font-bold tracking-wider">SOCKET.IO</span>
               <code class="text-sm text-slate-300">https://api.krisnadev.my.id</code>
           </div>
           <p class="text-xs text-slate-400 mb-3 border-t border-slate-700/50 pt-3">Contoh Implementasi Klien (HTML/JavaScript):</p>
           <pre id="code-ws" class="font-mono text-xs md:text-sm text-slate-300 overflow-x-auto whitespace-pre"><code>&lt;!-- Load library Socket.IO Client --&gt;
&lt;script src="https://cdn.socket.io/4.7.5/socket.io.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
  // Inisialisasi koneksi Socket.IO
  const socket = io("https://api.krisnadev.my.id", {
    transports: ["websocket", "polling"]
  });

  // Mendengarkan event 'device_status'
  socket.on("device_status", (data) => {
    console.log("Nomor:", data.device, "| Status:", data.status);
    
    if (data.status === "WAITING_PAIRING") {
       console.log("Masukkan kode pairing ini di WhatsApp Anda:", data.code);
    }
    else if (data.status === "CONNECTED") {
       console.log("WhatsApp berhasil terhubung dan siap digunakan!");
    }
  });
&lt;/script&gt;</code></pre>
           <button data-copy="code-ws" class="copy-btn absolute top-3 right-3 bg-slate-700 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
        </div>
      </div>
    </div>
`;

endpoints.forEach(ep => {
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');
    let badgeColorClass = ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                       (ep.method === 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20');
    let authBadge = ep.badge === 'master' ? '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Requires x-master-key</span>' : '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Requires x-api-key</span>';

    html += `
    <div id="tab-${epId}" class="tab-content hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10 w-full max-w-full">
      <div class="px-4 md:px-8 py-4 border-b border-slate-700/50 bg-slate-800/80 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 w-full">
         <div class="flex items-center gap-3 min-w-0">
            <span class="px-3 py-1 rounded-md text-xs font-bold border ${badgeColorClass} shrink-0">${ep.method}</span>
            <code class="text-slate-200 font-mono text-sm md:text-lg font-bold truncate">${ep.path}</code>
         </div>
         <span class="text-slate-400 text-xs md:text-sm md:ml-auto md:text-right leading-snug">${ep.summary}</span>
      </div>
      
      <div class="p-4 md:p-8 w-full max-w-full overflow-hidden">
         <div class="mb-6 flex flex-wrap gap-2">${authBadge}</div>
`;

    if (ep.params && ep.params.length > 0) {
        html += `
         <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Parameters</h5>
         <div class="overflow-x-auto rounded-xl border border-slate-700/50 shadow-inner mb-8 w-full max-w-full">
            <table class="w-full text-left text-sm whitespace-nowrap">
               <thead class="bg-slate-800/80 text-slate-400">
                 <tr><th class="px-4 py-3 font-semibold">Field</th><th class="px-4 py-3 font-semibold">Type</th><th class="px-4 py-3 font-semibold">Status</th><th class="px-4 py-3 font-semibold">Deskripsi</th></tr>
               </thead>
               <tbody class="divide-y divide-slate-700/50">`;
        ep.params.forEach(p => {
            let statBadge = p.status.toLowerCase() === 'wajib' ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">wajib</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">opsional</span>';
            html += `
                 <tr class="hover:bg-slate-800/50 transition-colors">
                    <td class="px-4 py-3"><code class="text-amber-300 font-mono text-xs md:text-sm">${p.field}</code></td>
                    <td class="px-4 py-3 text-slate-300 text-xs md:text-sm">${p.type}</td>
                    <td class="px-4 py-3">${statBadge}</td>
                    <td class="px-4 py-3 text-slate-400 text-xs md:text-sm break-words whitespace-normal min-w-[200px]">${p.desc}</td>
                 </tr>`;
        });
        html += `
               </tbody>
            </table>
         </div>`;
    }

    if (ep.reqBody) {
        let safeReqBody = ep.reqBody.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += `
         <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Contoh Request Body</h5>
         <div class="relative group overflow-x-auto bg-black/50 p-4 md:p-5 rounded-xl border border-slate-700/50 mb-8 shadow-inner w-full">
           <pre id="code-req-${epId}" class="font-mono text-xs md:text-sm text-indigo-300 whitespace-pre">${safeReqBody}</pre>
           <button data-copy="code-req-${epId}" class="copy-btn absolute top-2 right-2 bg-slate-700 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
         </div>`;
    }

    let safeResSuccess = ep.resSuccess.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let safeResError = ep.resError.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    html += `
         <h5 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Contoh Response</h5>
         <div class="flex flex-col lg:flex-row gap-6 w-full">
            <div class="flex-1 w-full min-w-0">
               <div class="text-emerald-400 font-bold mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-emerald-500"></div><small>Berhasil (200 / 201)</small></div>
               <div class="relative group overflow-x-auto bg-emerald-950/20 p-4 md:p-5 rounded-xl border border-emerald-900/50 h-full shadow-inner">
                 <pre id="code-res-suc-${epId}" class="font-mono text-xs md:text-sm text-emerald-200/90 whitespace-pre">${safeResSuccess}</pre>
                 <button data-copy="code-res-suc-${epId}" class="copy-btn absolute top-2 right-2 bg-emerald-800 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
               </div>
            </div>
            <div class="flex-1 w-full min-w-0 mt-4 lg:mt-0">
               <div class="text-rose-400 font-bold mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-500"></div><small>Gagal (4xx / 5xx)</small></div>
               <div class="relative group overflow-x-auto bg-rose-950/20 p-4 md:p-5 rounded-xl border border-rose-900/50 h-full shadow-inner">
                 <pre id="code-res-err-${epId}" class="font-mono text-xs md:text-sm text-rose-200/90 whitespace-pre">${safeResError}</pre>
                 <button data-copy="code-res-err-${epId}" class="copy-btn absolute top-2 right-2 bg-rose-800 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
               </div>
            </div>
         </div>
      </div>
    </div>`;
});

html += `
    <footer class="mt-12 pt-6 border-t border-slate-800/80 text-center text-slate-500 text-sm">
        &copy; 2026 Krisna WA Gateway.
    </footer>
  </main>
</div>

<script>
// Hamburger Menu Logic
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleMobileMenu() {
    sidebar.classList.toggle('hidden');
    sidebarOverlay.classList.toggle('hidden');
}
if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
if(sidebarOverlay) sidebarOverlay.addEventListener('click', toggleMobileMenu);

// Tab Switcher Logic
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    
    // Show target tab
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.remove('hidden');
    
    // Reset all sidebar links
    document.querySelectorAll('.tab-link').forEach(el => {
        el.classList.remove('bg-indigo-900/30', 'text-indigo-300', 'border-l-4', 'border-indigo-500', 'pl-1');
        el.classList.add('text-slate-400');
    });
    
    // Highlight active sidebar links
    document.querySelectorAll('.link-' + tabId).forEach(activeLink => {
        activeLink.classList.remove('text-slate-400');
        activeLink.classList.add('bg-indigo-900/30', 'text-indigo-300', 'border-l-4', 'border-indigo-500', 'pl-1');
    });
    
    // Close mobile menu if open
    if(window.innerWidth < 768 && !sidebar.classList.contains('hidden')) {
        toggleMobileMenu();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Copy to Clipboard with SweetAlert2
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
            title: 'Berhasil disalin!',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500,
            background: '#1e293b',
            color: '#f8fafc',
            iconColor: '#34d399',
            customClass: { popup: 'border border-slate-700 shadow-xl' }
        });
    });
}


// CSP-compliant event listeners
document.querySelectorAll('.tab-link').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        if(tabId) switchTab(tabId);
    });
});

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const copyId = this.getAttribute('data-copy');
        if(copyId) copyToClipboard(copyId);
    });
});

// Init default tab
document.addEventListener('DOMContentLoaded', () => {
    switchTab('top');
});
</script>
</body>
</html>
`;
fs.writeFileSync(require("path").join(__dirname, "docs", "index.html"), html);
console.log("Successfully generated complete docs/index.html with Native JS Tab UI");
