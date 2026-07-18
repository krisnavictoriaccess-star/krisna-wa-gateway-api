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

// --- MOBILE NAVBAR GENERATION ---
let mobileNavHtml = `<nav class="md:hidden sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 overflow-x-auto whitespace-nowrap px-4 py-3 flex gap-3 shadow-lg shadow-black/20 snap-x">
  <a href="#top" class="snap-start px-4 py-2 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">Base URL & Auth</a>`;

let addedCategories = new Set();
endpoints.forEach(ep => {
    if (ep.category && !addedCategories.has(ep.category)) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        mobileNavHtml += `\n  <a href="#${catId}" class="snap-start px-4 py-2 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">${ep.category}</a>`;
        addedCategories.add(ep.category);
    }
});
mobileNavHtml += `\n  <a href="#websocket" class="snap-start px-4 py-2 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">WebSockets</a>\n</nav>`;


// --- DESKTOP SIDEBAR GENERATION ---
let desktopSidebarHtml = `<aside class="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 overflow-y-auto border-r border-slate-800 py-8 px-4 lg:px-6 bg-slate-900/50">
  <h2 class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 px-2">Navigasi API</h2>
  <a href="#top" class="block px-2 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">🌍 Base URL & Auth</a>
`;

let currentCategory = "";
endpoints.forEach(ep => {
    if (ep.category && ep.category !== currentCategory) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        desktopSidebarHtml += `\n  <div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">${ep.category}</div>`;
        currentCategory = ep.category;
    }
    
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');
    let badgeColorClass = ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          (ep.method === 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-400 border-rose-500/20');
                          
    desktopSidebarHtml += `
  <a href="#${epId}" class="block px-2 py-1.5 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2">
    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold border ${badgeColorClass} w-10 text-center">${ep.method}</span>
    <span class="truncate">${ep.path}</span>
  </a>`;
});

desktopSidebarHtml += `
  <div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Events</div>
  <a href="#websocket" class="block px-2 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">⚡ WebSockets</a>
</aside>`;


// --- MAIN HTML BOILERPLATE ---
let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krisna WA Gateway - Dokumentasi API Komprehensif</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
    </style>
</head>
<body class="bg-slate-900 text-slate-300 font-sans antialiased selection:bg-blue-500/30">

${mobileNavHtml}

<div class="flex max-w-[1600px] mx-auto">
  ${desktopSidebarHtml}

  <main class="flex-1 p-5 md:p-8 lg:p-12 min-w-0">
    <header class="mb-10 md:mb-16 border-b border-slate-800/80 pb-8">
      <h1 class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-4 tracking-tight">Krisna WA Gateway API</h1>
      <p class="text-slate-400 text-base md:text-lg">Referensi Lengkap Integrasi Gateway Enterprise</p>
    </header>

    <section id="top" class="mb-16 scroll-mt-24 md:scroll-mt-8">
      <div class="bg-blue-900/10 border border-blue-800/40 rounded-2xl p-5 md:p-8 mb-8 shadow-xl shadow-black/20">
         <h3 class="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">🌍 Base URL</h3>
         <code class="block overflow-x-auto bg-black/60 p-4 md:p-5 rounded-xl text-amber-400 font-mono text-sm md:text-lg border border-slate-800 shadow-inner">https://api.krisnamarket.my.id</code>
      </div>
      
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 md:p-8 shadow-xl shadow-black/20">
         <h3 class="text-slate-200 font-bold mb-3 flex items-center gap-2 text-lg">🔐 Autentikasi (Headers)</h3>
         <p class="text-slate-400 mb-5 text-sm md:text-base">Selalu sertakan kredensial di header HTTP (bukan di URL parameter).</p>
         <div class="overflow-x-auto rounded-xl border border-slate-700/60 shadow-inner">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-800 text-slate-300">
                <tr><th class="px-5 py-3 font-semibold">Header</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 font-semibold">Deskripsi</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-master-key</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Wajib (Admin)</span></td>
                  <td class="px-5 py-4 text-slate-400">Untuk akses endpoint master (manajemen klien).</td>
                </tr>
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-api-key</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Wajib (Klien)</span></td>
                  <td class="px-5 py-4 text-slate-400">Token klien yang didapatkan dari proses Generate.</td>
                </tr>
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">sender_id</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Opsional</span></td>
                  <td class="px-5 py-4 text-slate-400">Digunakan pada fitur Messaging untuk memilih nomor pengirim spesifik. Kosongkan untuk mode Rotator.</td>
                </tr>
              </tbody>
            </table>
         </div>
      </div>
    </section>`;


// --- API ENDPOINTS LOOP ---
endpoints.forEach(ep => {
    if (ep.category) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        html += `\n    <h3 id="${catId}" class="text-2xl font-bold text-slate-200 mt-20 mb-8 pb-3 border-b border-slate-800 scroll-mt-24 md:scroll-mt-8">${ep.category}</h3>\n`;
    }

    const badgeColorClass = ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                           (ep.method === 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                           'bg-rose-500/10 text-rose-400 border-rose-500/20');
                           
    const authBadge = ep.badge === 'master' ? 
      '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Requires x-master-key</span>' : 
      '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Requires x-api-key</span>';
      
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');

    html += `
    <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10 scroll-mt-24 md:scroll-mt-8 group hover:border-slate-600/60 transition-colors" id="${epId}">
      <!-- Card Header -->
      <div class="px-5 md:px-8 py-4 border-b border-slate-700/50 bg-slate-800/80 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
         <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-md text-xs font-bold border ${badgeColorClass}">${ep.method}</span>
            <code class="text-slate-200 font-mono text-[15px] md:text-lg font-bold">${ep.path}</code>
         </div>
         <span class="text-slate-400 text-sm md:ml-auto md:text-right leading-snug">${ep.summary}</span>
      </div>
      
      <!-- Card Body -->
      <div class="p-5 md:p-8">
         <div class="mb-8 flex flex-wrap gap-2">${authBadge}</div>
`;

    // Params table
    if (ep.params && ep.params.length > 0) {
        html += `
         <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Parameters</h5>
         <div class="overflow-x-auto rounded-xl border border-slate-700/50 shadow-inner mb-8">
            <table class="w-full text-left text-sm whitespace-nowrap">
               <thead class="bg-slate-800/80 text-slate-400">
                 <tr>
                   <th class="px-5 py-3 font-semibold">Field</th>
                   <th class="px-5 py-3 font-semibold">Type</th>
                   <th class="px-5 py-3 font-semibold">Status</th>
                   <th class="px-5 py-3 font-semibold">Deskripsi</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-700/50">`;
               
        ep.params.forEach(p => {
            const statBadge = p.status.toLowerCase() === 'wajib' ? 
              '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">wajib</span>' : 
              '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">opsional</span>';
            html += `
                 <tr class="hover:bg-slate-800/50 transition-colors">
                    <td class="px-5 py-3"><code class="text-amber-300 font-mono">${p.field}</code></td>
                    <td class="px-5 py-3 text-slate-300">${p.type}</td>
                    <td class="px-5 py-3">${statBadge}</td>
                    <td class="px-5 py-3 text-slate-400">${p.desc}</td>
                 </tr>`;
        });
        html += `
               </tbody>
            </table>
         </div>`;
    }

    // Req body
    if (ep.reqBody) {
        html += `
         <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Contoh Request Body (JSON)</h5>
         <div class="overflow-x-auto bg-black/50 p-5 rounded-xl border border-slate-700/50 mb-8 shadow-inner">
           <pre class="font-mono text-sm text-indigo-300">${ep.reqBody}</pre>
         </div>`;
    }

    // Responses
    html += `
         <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Contoh Response</h5>
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
               <div class="text-emerald-400 font-bold mb-2 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-emerald-500"></div><small>Berhasil (200 / 201)</small></div>
               <div class="overflow-x-auto bg-emerald-950/20 p-5 rounded-xl border border-emerald-900/50 h-full shadow-inner">
                 <pre class="font-mono text-sm text-emerald-200/90">${ep.resSuccess}</pre>
               </div>
            </div>
            <div>
               <div class="text-rose-400 font-bold mb-2 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-500"></div><small>Gagal (4xx / 5xx)</small></div>
               <div class="overflow-x-auto bg-rose-950/20 p-5 rounded-xl border border-rose-900/50 h-full shadow-inner">
                 <pre class="font-mono text-sm text-rose-200/90">${ep.resError}</pre>
               </div>
            </div>
         </div>
      </div>
    </div>`;
});

// Write WebSockets section at the bottom
html += `
    <h3 id="websocket" class="text-2xl font-bold text-slate-200 mt-20 mb-8 pb-3 border-b border-slate-800 scroll-mt-24 md:scroll-mt-8">WebSockets</h3>
    <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10">
      <div class="p-5 md:p-8">
        <p class="text-slate-400 mb-4">API ini menyediakan WebSocket untuk *real-time updates* seperti status pengiriman pesan atau event device.</p>
        <div class="overflow-x-auto bg-black/50 p-5 rounded-xl border border-slate-700/50 shadow-inner">
           <pre class="font-mono text-sm text-blue-300">ws://api.krisnamarket.my.id</pre>
        </div>
      </div>
    </div>
  </main>
</div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'docs', 'index.html'), html);
console.log('Successfully generated complete docs/index.html with Tailwind CSS');
