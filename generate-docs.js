const fs = require('fs');
const path = require('path');

const endpoints = [
    // ----------------------------------------------------
    // ADMIN MASTER
    // ----------------------------------------------------
    {
        category: "👑 Admin / Master (Manajemen API Key)",
        method: "GET", path: "/api-key/list",
        summary: "Melihat daftar semua akun klien (API Key) yang terdaftar di database.",
        badge: "master",
        params: [],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "data": [
    {
      "key": "KEY-ABC123DEF456",
      "label": "Toko Utama",
      "paket": "Premium",
      "limit_pesan": 50000,
      "terpakai_bulan_ini": 1500,
      "sisa_kuota": 48500,
      "status": "active",
      "expired_at": "2026-12-31T23:59:59Z"
    }
  ]
}`,
        resError: `{
  "status": false,
  "message": "Akses ditolak. Master Key salah atau tidak ditemukan."
}`
    },
    {
        method: "POST", path: "/api-key/generate",
        summary: "Membuat kredensial API Key baru untuk klien.",
        badge: "master",
        params: [
            { field: "paket", type: "String", status: "opsional", desc: "Pilihan: Free, Lite, Pro, Premium. Default: Free." },
            { field: "label", type: "String", status: "opsional", desc: "Nama atau identitas klien. Default: User." },
            { field: "expiry_days", type: "Integer", status: "opsional", desc: "Masa aktif dalam hitungan hari. Default: 30." }
        ],
        reqBody: `{
  "paket": "Pro",
  "label": "Klien VIP",
  "expiry_days": 365
}`,
        resSuccess: `{
  "status": true,
  "message": "API Key berhasil dibuat.",
  "plain_key": "KEY-XXXXYYYYZZZZ",
  "data": { ... }
}`,
        resError: `{
  "status": false,
  "message": "Paket tidak valid."
}`
    },
    {
        method: "POST", path: "/api-key/extend",
        summary: "Menambahkan masa aktif (hari) pada klien yang sudah ada.",
        badge: "master",
        params: [
            { field: "target_api_key", type: "String", status: "wajib", desc: "API Key milik klien yang akan diperpanjang." },
            { field: "tambah_hari", type: "Integer", status: "wajib", desc: "Jumlah hari yang akan ditambahkan ke masa aktif." }
        ],
        reqBody: `{
  "target_api_key": "KEY-XXXXYYYYZZZZ",
  "tambah_hari": 30
}`,
        resSuccess: `{
  "status": true,
  "message": "Masa aktif berhasil diperpanjang."
}`,
        resError: `{
  "status": false,
  "message": "API Key tidak ditemukan."
}`
    },
    {
        method: "POST", path: "/api-key/upgrade",
        summary: "Mengubah tipe paket atau limit pesan bulanan klien.",
        badge: "master",
        params: [
            { field: "target_api_key", type: "String", status: "wajib", desc: "API Key target." },
            { field: "nama_paket", type: "String", status: "wajib", desc: "Paket baru (Free, Lite, Pro, Premium)." }
        ],
        reqBody: `{
  "target_api_key": "KEY-XXXXYYYYZZZZ",
  "nama_paket": "Premium"
}`,
        resSuccess: `{
  "status": true,
  "message": "Paket API Key berhasil di-upgrade ke Premium."
}`,
        resError: `{
  "status": false,
  "message": "Gagal melakukan upgrade. Paket tidak valid."
}`
    },
    {
        method: "POST", path: "/api-key/delete",
        summary: "Menghapus klien secara permanen dari server.",
        badge: "master",
        params: [
            { field: "target_api_key", type: "String", status: "wajib", desc: "API Key target yang akan dihapus." }
        ],
        reqBody: `{
  "target_api_key": "KEY-XXXXYYYYZZZZ"
}`,
        resSuccess: `{
  "status": true,
  "message": "API Key berhasil dihapus permanen."
}`,
        resError: `{
  "status": false,
  "message": "API Key tidak ditemukan di database."
}`
    },
    {
        method: "GET", path: "/device/all",
        summary: "Memantau seluruh sesi perangkat WhatsApp dari SEMUA pengguna di server.",
        badge: "master",
        params: [],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "total_devices": 2,
  "data": [
    { "device": "628111", "status": "CONNECTED" },
    { "device": "628222", "status": "DISCONNECTED" }
  ]
}`,
        resError: `{ "status": false, "message": "Unauthorized" }`
    },
    {
        method: "GET", path: "/queue/all",
        summary: "Memantau lalu lintas seluruh antrean pesan server secara global.",
        badge: "master",
        params: [],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "global_queue_count": 154,
  "queues": [ ... ]
}`,
        resError: `{ "status": false, "message": "Unauthorized" }`
    },

    // ----------------------------------------------------
    // KLIEN API KEY INFO
    // ----------------------------------------------------
    {
        category: "👤 Informasi Klien (API Key)",
        method: "GET", path: "/api-key/info",
        summary: "Mengecek sisa kuota, limit, dan masa tenggang API Key Anda sendiri.",
        badge: "user",
        params: [],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "data": {
    "paket": "Pro",
    "status": "active",
    "limit_pesan": 50000,
    "terpakai_bulan_ini": 1520,
    "sisa_kuota": 48480,
    "expired_at": "2026-08-15T12:00:00Z"
  }
}`,
        resError: `{
  "status": false,
  "message": "API Key tidak valid atau sudah kadaluarsa."
}`
    },

    // ----------------------------------------------------
    // DEVICE MANAGEMENT
    // ----------------------------------------------------
    {
        category: "📱 Device Management (Sesi WA)",
        method: "POST", path: "/device/add",
        summary: "Menyambungkan nomor WhatsApp ke server untuk mendapatkan Pairing Code.",
        badge: "user",
        params: [
            { field: "nomor_device", type: "String", status: "wajib", desc: "Nomor HP WA Anda beserta kode negara tanpa '+' (contoh: 628xxx)." }
        ],
        reqBody: `{
  "nomor_device": "628123456789"
}`,
        resSuccess: `{
  "status": true,
  "message": "Silakan masukkan kode pairing ini di WhatsApp.",
  "pairing_code": "V5Y2A9XR",
  "device_status": "WAITING_PAIRING"
}`,
        resError: `{
  "status": false,
  "message": "Nomor HP tidak valid."
}`
    },
    {
        method: "GET", path: "/device/list",
        summary: "Melihat daftar perangkat/nomor WhatsApp milik Anda yang tersambung di server.",
        badge: "user",
        params: [],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "data": [
    { "device": "628123456789", "status": "CONNECTED" }
  ]
}`,
        resError: `{ "status": false, "message": "API Key tidak valid." }`
    },
    {
        method: "POST", path: "/device/settings",
        summary: "Mengubah pengaturan otomatisasi pada perangkat spesifik.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor device Anda di HTTP Header." },
            { field: "is_autoread", type: "Boolean", status: "wajib", desc: "Aktifkan atau matikan fitur membaca/centang biru otomatis (true/false)." }
        ],
        reqBody: `{
  "is_autoread": true
}`,
        resSuccess: `{
  "status": true,
  "message": "Pengaturan perangkat berhasil diperbarui."
}`,
        resError: `{
  "status": false,
  "message": "Device tidak ditemukan atau Anda tidak memiliki akses."
}`
    },
    {
        method: "POST", path: "/device/delete",
        summary: "Logout dan putuskan sambungan WhatsApp Anda dari server secara paksa.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor device yang akan dilogout di HTTP Header." }
        ],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "message": "Sesi WhatsApp berhasil dihapus dan dilogout."
}`,
        resError: `{
  "status": false,
  "message": "Gagal menghapus sesi."
}`
    },

    // ----------------------------------------------------
    // KONTAK & DATA
    // ----------------------------------------------------
    {
        category: "📇 Kontak & Data",
        method: "GET", path: "/contact/list",
        summary: "Mengambil daftar kontak (nomor dan nama) yang tersimpan di HP Anda.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor HP/device Anda di HTTP Header." }
        ],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "data": [
    { "id": "628111@s.whatsapp.net", "name": "Budi Santoso", "notify": "Budi" }
  ]
}`,
        resError: `{
  "status": false,
  "message": "Device tidak terhubung."
}`
    },
    {
        method: "GET", path: "/group/list",
        summary: "Mengambil daftar ID Grup tempat Anda bergabung (dibutuhkan untuk kirim pesan grup).",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor HP/device Anda di HTTP Header." }
        ],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "data": [
    { "id": "1234567890@g.us", "subject": "Grup Keluarga Besar" }
  ]
}`,
        resError: `{
  "status": false,
  "message": "Device tidak terhubung."
}`
    },
    {
        method: "GET", path: "/inbox",
        summary: "Melihat daftar pesan terakhir yang masuk (hanya berfungsi jika record_inbox diaktifkan).",
        badge: "user",
        params: [],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "data": [
    { "from": "628111@s.whatsapp.net", "message": "Halo, barang ready?", "timestamp": 1718000000 }
  ]
}`,
        resError: `{
  "status": false,
  "message": "Gagal mengambil inbox."
}`
    },

    // ----------------------------------------------------
    // WEBHOOKS & AUTO REPLY
    // ----------------------------------------------------
    {
        category: "🤖 Webhooks & Auto-Reply",
        method: "POST", path: "/webhook/set",
        summary: "Mengatur URL sistem/server Anda sendiri untuk menerima notifikasi pesan masuk secara Real-Time.",
        badge: "user",
        params: [
            { field: "webhook_url", type: "String", status: "wajib", desc: "URL publik server Anda yang akan menerima POST request." }
        ],
        reqBody: `{
  "webhook_url": "https://server-anda.com/api/wa-callback"
}`,
        resSuccess: `{
  "status": true,
  "message": "Webhook URL berhasil disimpan."
}`,
        resError: `{
  "status": false,
  "message": "URL tidak valid."
}`
    },
    {
        method: "POST", path: "/auto-reply/add",
        summary: "Membuat robot balasan otomatis berdasarkan kata kunci spesifik.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor device/bot yang akan merespon diletakkan di HTTP Header." },
            { field: "keyword", type: "String", status: "wajib", desc: "Kata pemicu." },
            { field: "response", type: "String", status: "wajib", desc: "Balasan yang akan dikirim bot." },
            { field: "match_type", type: "String", status: "opsional", desc: "exact (sama persis) / contains (mengandung). Default: exact." },
            { field: "media_url", type: "String", status: "opsional", desc: "Tautan URL publik untuk mengirim gambar/video/dokumen bersamaan dengan respon." },
            { field: "media_type", type: "String", status: "opsional", desc: "Tipe file media (contoh: image, video, document)." }
        ],
        reqBody: `{
  "keyword": "harga",
  "response": "Berikut adalah daftar harga kami:",
  "match_type": "exact",
  "media_url": "https://domain.com/brosur.jpg",
  "media_type": "image"
}`,
        resSuccess: `{
  "status": true,
  "message": "Auto-Reply berhasil ditambahkan."
}`,
        resError: `{
  "status": false,
  "message": "Keyword atau response tidak boleh kosong."
}`
    },
    {
        method: "GET", path: "/auto-reply/list",
        summary: "Melihat daftar seluruh aturan Auto-Reply yang telah Anda buat.",
        badge: "user",
        params: [
            { field: "sender_id", type: "String (Header)", status: "wajib", desc: "Nomor HP/device Anda di HTTP Header." }
        ],
        reqBody: null,
        resSuccess: `{
  "status": true,
  "data": [
    { "keyword": "ping", "response": "pong!", "match_type": "exact" }
  ]
}`,
        resError: `{ "status": false, "message": "Gagal mengambil data." }`
    },
    {
        method: "POST", path: "/auto-reply/delete",
        summary: "Menghapus salah satu kata kunci Auto-Reply.",
        badge: "user",
        params: [
            { field: "id", type: "Integer", status: "wajib", desc: "ID Auto-Reply yang akan dihapus." }
        ],
        reqBody: `{
  "id": 12
}`,
        resSuccess: `{
  "status": true,
  "message": "Auto-Reply berhasil dihapus."
}`,
        resError: `{
  "status": false,
  "message": "Auto-Reply tidak ditemukan."
}`
    },

    // ----------------------------------------------------
    // MESSAGING
    // ----------------------------------------------------
    {
        category: "✉️ Messaging (Pengiriman)",
        method: "POST", path: "/kirim-pesan",
        summary: "Mengirim pesan teks ke satu nomor.",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan (628xxx)." },
            { field: "pesan", type: "String", status: "wajib", desc: "Isi pesan teks." },
            { field: "media_url", type: "String", status: "opsional", desc: "Tautan/URL gambar jika ingin mengirim pesan gambar." },
            { field: "media_type", type: "String", status: "opsional", desc: "Tipe media (saat ini mendukung image, video, document)." }
        ],
        reqBody: `{
  "nomor": "628123456789",
  "pesan": "Halo bosku!"
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil dimasukkan ke antrean pengiriman.",
  "queue_id": 150
}`,
        resError: `{
  "status": false,
  "message": "Kuota pesan Anda habis."
}`
    },
    {
        method: "POST", path: "/kirim-massal",
        summary: "Mengirim broadcast ke banyak nomor sekaligus menggunakan sistem antrean anti-banned.",
        badge: "user",
        params: [
            { field: "pesan_list", type: "Array", status: "wajib", desc: "Daftar objek tujuan dan pesannya." }
        ],
        reqBody: `{
  "pesan_list": [
    { "nomor": "628111", "pesan": "Pesan 1" },
    { "nomor": "628222", "pesan": "Pesan 2" }
  ]
}`,
        resSuccess: `{
  "status": true,
  "message": "2 pesan berhasil dimasukkan ke antrean massal."
}`,
        resError: `{
  "status": false,
  "message": "Format data tidak valid, harus berupa array."
}`
    },
    {
        method: "POST", path: "/kirim-media",
        summary: "Mengirim dokumen, gambar, atau video berdasarkan tautan publik.",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan." },
            { field: "url", type: "String", status: "wajib", desc: "Tautan/URL publik file Anda." },
            { field: "tipe", type: "String", status: "wajib", desc: "Tipe file: image, video, document." },
            { field: "caption", type: "String", status: "opsional", desc: "Keterangan/teks pendamping gambar/video." }
        ],
        reqBody: `{
  "nomor": "628123456789",
  "url": "https://domain.com/brosur.pdf",
  "tipe": "document",
  "caption": "Ini brosur bulan ini."
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan media berhasil masuk antrean."
}`,
        resError: `{
  "status": false,
  "message": "Media URL tidak dapat diakses."
}`
    },
    {
        method: "POST", path: "/kirim-grup",
        summary: "Mengirim pesan teks ke dalam Grup WhatsApp.",
        badge: "user",
        params: [
            { field: "group_id", type: "String", status: "wajib", desc: "ID Grup (diperoleh dari endpoint /group/list)." },
            { field: "pesan", type: "String", status: "wajib", desc: "Isi pesan teks." }
        ],
        reqBody: `{
  "group_id": "1234567890-123456@g.us",
  "pesan": "Halo member grup!"
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan berhasil masuk antrean grup."
}`,
        resError: `{
  "status": false,
  "message": "Group ID tidak valid."
}`
    },
    {
        method: "POST", path: "/kirim-polling",
        summary: "Mengirimkan formulir interaktif (Voting/Polling).",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan." },
            { field: "nama_polling", type: "String", status: "wajib", desc: "Judul pertanyaan polling." },
            { field: "opsi", type: "Array", status: "wajib", desc: "Pilihan jawaban (minimal 2)." },
            { field: "multiple_choice", type: "Boolean", status: "opsional", desc: "Apabila true, user bisa memilih lebih dari satu opsi. Default: false." }
        ],
        reqBody: `{
  "nomor": "628123456789",
  "nama_polling": "Berapa umur Anda?",
  "opsi": ["18-25", "26-35", "35+"],
  "multiple_choice": false
}`,
        resSuccess: `{
  "status": true,
  "message": "Polling berhasil dikirim."
}`,
        resError: `{
  "status": false,
  "message": "Values polling minimal harus berisi 2 opsi."
}`
    },
    {
        method: "POST", path: "/kirim-lokasi",
        summary: "Mengirimkan pin koordinat peta (Google Maps).",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor tujuan." },
            { field: "lat", type: "Number", status: "wajib", desc: "Latitude (Garis Lintang)." },
            { field: "long", type: "Number", status: "wajib", desc: "Longitude (Garis Bujur)." }
        ],
        reqBody: `{
  "nomor": "628123456789",
  "lat": -6.200000,
  "long": 106.816666
}`,
        resSuccess: `{
  "status": true,
  "message": "Pesan lokasi berhasil dikirim."
}`,
        resError: `{
  "status": false,
  "message": "Latitude dan Longitude wajib diisi dengan angka."
}`
    },
    {
        method: "POST", path: "/kirim-vcard",
        summary: "Mengirimkan kartu kontak.",
        badge: "user",
        params: [
            { field: "nomor", type: "String", status: "wajib", desc: "Nomor penerima pesan." },
            { field: "nama_kontak", type: "String", status: "wajib", desc: "Nama kontak yang akan dibagikan." },
            { field: "nomor_kontak", type: "String", status: "wajib", desc: "Nomor telepon kontak yang akan dibagikan." }
        ],
        reqBody: `{
  "nomor": "628123456789",
  "nama_kontak": "CS Support",
  "nomor_kontak": "+628111222333"
}`,
        resSuccess: `{
  "status": true,
  "message": "Kontak VCard berhasil dikirim."
}`,
        resError: `{
  "status": false,
  "message": "Parameter kontak tidak lengkap."
}`
    },

    // ----------------------------------------------------
    // QUEUE
    // ----------------------------------------------------
    {
        category: "⏳ Manajemen Antrean (Queue)",
        method: "GET", path: "/queue/my",
        summary: "Memantau status seluruh antrean pesan milik Anda (Pending/Sukses/Gagal).",
        badge: "user",
        params: [],
        reqBody: null,
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
        summary: "Membatalkan seluruh pesan di antrean yang belum sempat terkirim.",
        badge: "user",
        params: [
            { field: "device", type: "String", status: "opsional", desc: "Nomor pengirim jika ingin membatalkan antrean pada device tertentu." }
        ],
        reqBody: `{
  "device": "628123456789"
}`,
        resSuccess: `{
  "status": true,
  "message": "Antrean berhasil dibatalkan."
}`,
        resError: `{
  "status": false,
  "message": "Queue ID tidak ditemukan atau sudah diproses."
}`
    }
];

let sidebarHtml = `
    <div class="offcanvas-md offcanvas-start bg-dark border-end border-secondary" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
      <div class="offcanvas-header border-bottom border-secondary">
        <h5 class="offcanvas-title" id="sidebarMenuLabel">Navigasi API</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto" style="height: 100vh;">
        <ul class="nav flex-column mb-auto px-3">
          <li class="nav-item mb-2">
            <a class="nav-link text-white fw-bold" href="#top">🌍 Base URL & Auth</a>
          </li>
`;

endpoints.forEach(ep => {
    if (ep.category) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        sidebarHtml += `
          <li class="nav-item mt-3 mb-1">
            <a class="nav-link text-info fw-bold py-1" href="#${catId}">${ep.category}</a>
          </li>`;
    }
    
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');
    let badgeColor = ep.method === 'GET' ? 'success' : (ep.method === 'POST' ? 'warning text-dark' : 'danger');
    sidebarHtml += `
          <li class="nav-item">
            <a class="nav-link text-secondary py-1 fs-6" href="#${epId}">
              <span class="badge bg-${badgeColor} me-1" style="width: 50px;">${ep.method}</span> ${ep.path}
            </a>
          </li>`;
});

sidebarHtml += `
          <li class="nav-item mt-3 mb-4">
            <a class="nav-link text-info fw-bold py-1" href="#websocket">⚡ WebSockets</a>
          </li>
        </ul>
      </div>
    </div>
`;

let html = `<!DOCTYPE html>
<html lang="id" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krisna WA Gateway - Dokumentasi API</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; scroll-behavior: smooth; }
        .bg-card { background-color: #1e293b !important; }
        .bg-code { background-color: #000000 !important; border: 1px solid #334155; }
        .nav-link:hover { background-color: rgba(255,255,255,0.05); border-radius: 5px; color: #fff !important; }
        pre { color: #a5b4fc; }
        @media (min-width: 768px) {
            .sidebar-col { position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        }
    </style>
</head>
<body>

<header class="navbar sticky-top bg-dark flex-md-nowrap p-0 shadow border-bottom border-secondary" id="top">
  <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-5 text-white fw-bold bg-dark" href="#">Krisna WA Gateway</a>
  
  <ul class="navbar-nav flex-row d-md-none">
    <li class="nav-item text-nowrap">
      <button class="nav-link px-3 text-white border-0 bg-transparent" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
        ☰ Menu
      </button>
    </li>
  </ul>
</header>

<div class="container-fluid">
  <div class="row">
    <div class="sidebar-col col-md-3 col-lg-2 p-0 bg-dark border-end border-secondary">
        ${sidebarHtml}
    </div>

    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4" style="min-width: 0;">
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 class="h2 fw-bold text-primary">Referensi API Gateway</h1>
      </div>

      <div class="card bg-card text-white mb-4 border-primary shadow-sm">
        <div class="card-header bg-primary bg-opacity-25 fw-bold text-info">🌍 Base URL</div>
        <div class="card-body">
            <code class="fs-5 bg-code p-2 rounded d-block overflow-x-auto text-warning">https://api.krisnamarket.my.id</code>
        </div>
      </div>

      <div class="card bg-card text-white mb-5 border-secondary shadow-sm">
        <div class="card-header bg-secondary bg-opacity-25 fw-bold">🔐 Autentikasi (Headers)</div>
        <div class="card-body">
            <p class="text-secondary mb-3">Selalu sertakan kredensial di header HTTP (bukan di URL parameter).</p>
            <div class="table-responsive">
                <table class="table table-dark table-hover table-bordered mb-0 align-middle">
                    <thead>
                        <tr><th>Header</th><th>Status</th><th>Deskripsi</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><code>x-master-key</code></td><td><span class="badge bg-danger">Wajib (Admin)</span></td><td>Untuk akses endpoint master (manajemen klien).</td></tr>
                        <tr><td><code>x-api-key</code></td><td><span class="badge bg-danger">Wajib (Klien)</span></td><td>Token klien yang didapatkan dari proses Generate.</td></tr>
                        <tr><td><code>sender_id</code></td><td><span class="badge bg-success">Opsional</span></td><td>Digunakan pada fitur Messaging untuk memilih nomor pengirim spesifik. Kosongkan untuk mode Rotator.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
`;

endpoints.forEach(ep => {
    if (ep.category) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        html += `\n    <h3 id="${catId}" class="mt-5 mb-3 pb-2 border-bottom border-secondary text-info fw-bold" style="scroll-margin-top: 80px;">${ep.category}</h3>\n`;
    }

    const badgeColor = ep.method === 'GET' ? 'success' : (ep.method === 'POST' ? 'warning text-dark' : 'danger');
    const borderClass = ep.method === 'GET' ? 'border-success' : (ep.method === 'POST' ? 'border-warning' : 'border-danger');
    const authBadge = ep.badge === 'master' ? '<span class="badge bg-danger">Requires x-master-key</span>' : '<span class="badge bg-primary">Requires x-api-key</span>';
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');

    html += `
      <div class="card bg-card mb-4 ${borderClass} shadow-sm" id="${epId}" style="scroll-margin-top: 80px;">
        <div class="card-header d-flex flex-wrap align-items-center gap-3 bg-dark">
            <span class="badge bg-${badgeColor} fs-6">${ep.method}</span>
            <code class="fs-5 text-light fw-bold">${ep.path}</code>
            <span class="text-secondary ms-auto text-end">${ep.summary}</span>
        </div>
        <div class="card-body">
            <div class="mb-3">${authBadge}</div>
`;

    if (ep.params && ep.params.length > 0) {
        html += `
            <h5 class="text-light mt-3 mb-2">Body/Query Parameters</h5>
            <div class="table-responsive mb-4">
                <table class="table table-dark table-striped table-bordered align-middle">
                    <thead><tr><th>Field</th><th>Type</th><th>Status</th><th>Deskripsi</th></tr></thead>
                    <tbody>`;
        ep.params.forEach(p => {
            const statBadge = p.status.toLowerCase() === 'wajib' ? '<span class="badge bg-danger">wajib</span>' : '<span class="badge bg-success">opsional</span>';
            html += `
                        <tr>
                            <td class="text-warning"><code>${p.field}</code></td>
                            <td>${p.type}</td>
                            <td>${statBadge}</td>
                            <td class="text-secondary">${p.desc}</td>
                        </tr>`;
        });
        html += `
                    </tbody>
                </table>
            </div>`;
    }

    if (ep.reqBody) {
        html += `
            <h5 class="text-light mb-2">Contoh Request Body (JSON)</h5>
            <pre class="bg-code p-3 rounded mb-4 overflow-x-auto border border-secondary">${ep.reqBody}</pre>`;
    }

    html += `
            <h5 class="text-light mb-2">Contoh Response</h5>
            <div class="row g-3">
                <div class="col-lg-6">
                    <div class="text-success fw-bold mb-1"><small>Berhasil (200 OK / 201 Created)</small></div>
                    <pre class="bg-code p-3 rounded h-100 overflow-x-auto border border-success border-opacity-50">${ep.resSuccess}</pre>
                </div>
                <div class="col-lg-6">
                    <div class="text-danger fw-bold mb-1"><small>Gagal (4xx / 5xx Error)</small></div>
                    <pre class="bg-code p-3 rounded h-100 overflow-x-auto border border-danger border-opacity-50 text-danger-emphasis">${ep.resError}</pre>
                </div>
            </div>
        </div>
      </div>
`;
});

html += `
    </main>
  </div>
</div>

<!-- Bootstrap 5 JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    // Close offcanvas on mobile when clicking a link
    document.querySelectorAll('.sidebar-col .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const offcanvasEl = document.getElementById('sidebarMenu');
            if (window.innerWidth < 768 && offcanvasEl) {
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
                if(offcanvas) offcanvas.hide();
            }
        });
    });
</script>
</body>
</html>
`;

const fsOut = require('fs');
fsOut.writeFileSync(require('path').join(__dirname, 'docs', 'index.html'), html);
console.log('Successfully generated complete docs/index.html with Bootstrap 5');
