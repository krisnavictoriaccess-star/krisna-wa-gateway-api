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
            { field: "paket", type: "String", status: "wajib", desc: "Paket baru (Free, Lite, Pro, Premium)." }
        ],
        reqBody: `{
  "target_api_key": "KEY-XXXXYYYYZZZZ",
  "paket": "Premium"
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
            { field: "nomor_hp", type: "String", status: "wajib", desc: "Nomor HP WA Anda beserta kode negara tanpa '+' (contoh: 628xxx)." }
        ],
        reqBody: `{
  "nomor_hp": "628123456789"
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
            { field: "nomor_device", type: "String", status: "wajib", desc: "Nomor device Anda." },
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
            { field: "nomor_device", type: "String", status: "wajib", desc: "Nomor device yang akan dilogout." }
        ],
        reqBody: `{
  "nomor_device": "628123456789"
}`,
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
            { field: "nomor_device", type: "String", status: "wajib", desc: "Nomor device/bot yang akan merespon." },
            { field: "keyword", type: "String", status: "wajib", desc: "Kata pemicu." },
            { field: "response", type: "String", status: "wajib", desc: "Balasan yang akan dikirim bot." },
            { field: "match_type", type: "String", status: "opsional", desc: "exact (sama persis) / contains (mengandung). Default: exact." },
            { field: "media_url", type: "String", status: "opsional", desc: "Tautan URL publik untuk mengirim gambar/video/dokumen bersamaan dengan respon." },
            { field: "media_type", type: "String", status: "opsional", desc: "Tipe file media (contoh: image, video, document)." }
        ],
        reqBody: `{
  "nomor_device": "628123456789",
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
        summary: "Membatalkan pesan spesifik di antrean yang belum sempat terkirim.",
        badge: "user",
        params: [
            { field: "queue_id", type: "Integer", status: "wajib", desc: "ID antrean (didapat dari respon saat kirim-pesan)." }
        ],
        reqBody: `{
  "queue_id": 150
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

let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krisna WA Gateway - Dokumentasi API Komprehensif</title>
    <style>
        :root {
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --bg-code: #000000;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --border: #334155;
            --get: #10b981;
            --post: #f59e0b;
            --delete: #ef4444;
            --req: #ef4444;
            --opt: #10b981;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: var(--bg-dark); color: var(--text-main); line-height: 1.6; padding: 40px 20px; font-size: 15px; }
        .container { max-width: 1000px; margin: 0 auto; }

        header { text-align: center; margin-bottom: 50px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        h1 { font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(to right, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        header p { color: var(--text-muted); font-size: 1.1rem; }

        .base-url-box { background-color: rgba(59, 130, 246, 0.1); border: 1px solid var(--accent); padding: 20px; border-radius: 8px; margin-bottom: 40px; text-align: center; }
        .base-url-box h3 { color: #60a5fa; margin-bottom: 10px; }
        .base-url-box code { font-size: 1.4rem; color: #fbbf24; background: var(--bg-code); padding: 8px 16px; border-radius: 6px; letter-spacing: 1px; overflow-x: auto; white-space: nowrap; display: block; text-align: left; }

        .auth-box { background-color: var(--bg-card); padding: 20px; border-radius: 8px; border-left: 4px solid var(--accent); margin-bottom: 40px; }
        .auth-box h3 { color: var(--text-main); margin-bottom: 15px; }
        
        .table-wrapper { width: 100%; overflow-x: auto; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid var(--border); }
        th { background-color: rgba(255,255,255,0.05); color: #cbd5e1; font-weight: bold; }
        td { color: var(--text-muted); }
        code { font-family: 'Courier New', Courier, monospace; color: #fbbf24; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; }

        .section-title { font-size: 1.8rem; margin: 50px 0 20px; padding-bottom: 10px; border-bottom: 2px solid var(--border); color: #cbd5e1; }

        .endpoint { background-color: var(--bg-card); border-radius: 8px; margin-bottom: 30px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        
        .endpoint-header { display: flex; align-items: center; padding: 15px 20px; background-color: rgba(0,0,0,0.3); flex-wrap: wrap; }
        .method { padding: 5px 12px; border-radius: 4px; font-weight: bold; font-size: 0.95rem; margin-right: 15px; letter-spacing: 0.5px; }
        .method.get { background-color: rgba(16, 185, 129, 0.2); color: var(--get); border: 1px solid var(--get); }
        .method.post { background-color: rgba(245, 158, 11, 0.2); color: var(--post); border: 1px solid var(--post); }
        .method.delete { background-color: rgba(239, 68, 68, 0.2); color: var(--delete); border: 1px solid var(--delete); }
        
        .path { font-family: monospace; font-size: 1.2rem; flex-grow: 1; font-weight: bold; color: #e2e8f0; }
        .summary { color: var(--text-muted); font-size: 0.95rem; flex-basis: 100%; margin-top: 10px; }

        .endpoint-body { padding: 25px; border-top: 1px solid var(--border); }
        
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .badge.master { background-color: rgba(124, 58, 237, 0.2); color: #c4b5fd; border: 1px solid #7c3aed; }
        .badge.user { background-color: rgba(37, 99, 235, 0.2); color: #93c5fd; border: 1px solid #2563eb; }

        .req-opt { font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
        .req-opt.wajib { background-color: rgba(239, 68, 68, 0.1); color: var(--req); border: 1px solid var(--req); }
        .req-opt.opsional { background-color: rgba(16, 185, 129, 0.1); color: var(--opt); border: 1px solid var(--opt); }

        h4 { margin: 25px 0 10px; color: #cbd5e1; font-size: 1.1rem; border-left: 3px solid var(--accent); padding-left: 10px; }
        
        .code-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; min-width: 0; }
        .code-grid > div { min-width: 0; overflow: hidden; }
        
        pre { background-color: var(--bg-code); padding: 15px; border-radius: 6px; overflow-x: auto; font-family: 'Courier New', Courier, monospace; color: #a5b4fc; border: 1px solid var(--border); font-size: 0.9rem; line-height: 1.5; margin-bottom: 10px; max-width: 100%; box-sizing: border-box; }
        .pre-success { border-color: rgba(16, 185, 129, 0.5); }
        .pre-error { border-color: rgba(239, 68, 68, 0.5); color: #fca5a5; }

        .response-label { font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; display: block; color: var(--text-muted); }
        .text-success { color: #34d399; }
        .text-error { color: #f87171; }

        @media (max-width: 768px) { 
            .code-grid { grid-template-columns: 1fr; } 
            .endpoint-header { flex-direction: column; align-items: flex-start; }
            .path { font-size: 1rem; word-break: break-all; margin-top: 10px; }
            .summary { margin-top: 5px; }
        }
    </style>
</head>
<body>
<div class="container">
    <header>
        <h1>Krisna WA Gateway API</h1>
        <p>Referensi Lengkap Integrasi Gateway Enterprise</p>
    </header>

    <div class="base-url-box">
        <h3>🌍 Base URL</h3>
        <code>https://api.krisnamarket.my.id</code>
    </div>

    <div class="auth-box">
        <h3>🔐 Autentikasi (Headers)</h3>
        <p style="margin-bottom: 15px; color: var(--text-muted);">Selalu sertakan kredensial di header HTTP (bukan di URL parameter).</p>
        <div class="table-wrapper">
            <table>
                <tr><th>Header</th><th>Status</th><th>Deskripsi</th></tr>
                <tr><td><code>x-master-key</code></td><td><span class="req-opt wajib">Wajib (Admin)</span></td><td>Untuk akses endpoint master (manajemen klien).</td></tr>
                <tr><td><code>x-api-key</code></td><td><span class="req-opt wajib">Wajib (Klien)</span></td><td>Token klien yang didapatkan dari proses Generate.</td></tr>
                <tr><td><code>sender_id</code></td><td><span class="req-opt opsional">Opsional</span></td><td>Digunakan pada fitur Messaging untuk memilih nomor pengirim spesifik. Kosongkan untuk mode Rotator.</td></tr>
            </table>
        </div>
    </div>
`;

endpoints.forEach(ep => {
    if (ep.category) {
        html += `\n    <!-- KATEGORI BARU -->\n    <h2 class="section-title">${ep.category}</h2>\n`;
    }

    const methodClass = ep.method.toLowerCase();
    
    html += `
    <div class="endpoint">
        <div class="endpoint-header">
            <span class="method ${methodClass}">${ep.method}</span>
            <span class="path">${ep.path}</span>
            <span class="summary">${ep.summary}</span>
        </div>
        <div class="endpoint-body">
            <span class="badge ${ep.badge}">Requires ${ep.badge === 'master' ? 'x-master-key' : 'x-api-key'}</span>
`;

    // Params table
    if (ep.params && ep.params.length > 0) {
        html += `
            <h4>Body/Query Parameters</h4>
            <div class="table-wrapper">
                <table>
                    <tr><th>Field</th><th>Type</th><th>Status</th><th>Deskripsi</th></tr>`;
        ep.params.forEach(p => {
            const statClass = p.status.toLowerCase() === 'wajib' ? 'wajib' : 'opsional';
            html += `
                    <tr><td><code>${p.field}</code></td><td>${p.type}</td><td><span class="req-opt ${statClass}">${p.status}</span></td><td>${p.desc}</td></tr>`;
        });
        html += `
                </table>
            </div>`;
    }

    // Req body
    if (ep.reqBody) {
        html += `
            <h4>Contoh Request Body (JSON)</h4>
            <pre>${ep.reqBody}</pre>`;
    }

    // Responses
    html += `
            <h4 style="margin-top: 25px;">Contoh Response</h4>
            <div class="code-grid">
                <div>
                    <span class="response-label text-success">Berhasil (200 OK / 201 Created)</span>
                    <pre class="pre-success">${ep.resSuccess}</pre>
                </div>
                <div>
                    <span class="response-label text-error">Gagal (4xx / 5xx Error)</span>
                    <pre class="pre-error">${ep.resError}</pre>
                </div>
            </div>
        </div>
    </div>
`;
});

// Websocket Section
html += `
    <!-- WEBSOCKET -->
    <h2 class="section-title">⚡ Real-Time Events (WebSocket)</h2>

    <div class="endpoint">
        <div class="endpoint-header" style="background-color: rgba(59, 130, 246, 0.2);">
            <span class="method get" style="border-color: #3b82f6; color: #60a5fa;">SOCKET.IO</span>
            <span class="path">WSS Connection</span>
            <span class="summary">Dengarkan pembaruan status Pairing Code secara instan.</span>
        </div>
        <div class="endpoint-body">
            <p style="margin-bottom: 20px; color: var(--text-muted);">
                Saat Anda memanggil <code>/device/add</code>, server akan meminta WhatsApp untuk menghasilkan <b>Pairing Code (8 digit)</b>. Agar antarmuka Anda bisa merespon secara langsung (Real-Time) tanpa perlu memuat ulang (*refresh*), Anda wajib menggunakan <b>Socket.IO Client</b>.
            </p>

            <h4>Cara Koneksi di Frontend (JavaScript)</h4>
            <pre>&lt;script src="https://cdn.socket.io/4.7.2/socket.io.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
  const socket = io("https://api.krisnamarket.my.id");

  socket.on("device_status", (data) =&gt; {
      console.log("Pembaruan Status:", data);
      
      if(data.status === "WAITING_PAIRING") {
          alert("KODE PAIRING ANDA: " + data.code);
          // Tampilkan data.code ini ke layar besar Anda agar bisa dibaca jelas
      } else if (data.status === "CONNECTED") {
          alert("WhatsApp Berhasil Terhubung!");
      } else if (data.status === "DISCONNECTED") {
          alert("WhatsApp Terputus / Logout.");
      }
  });
&lt;/script&gt;</pre>

            <h4 style="margin-top: 30px;">Tabel Payload <code>device_status</code></h4>
            <div class="table-wrapper">
                <table>
                    <tr><th>Status</th><th>Deskripsi</th><th>Property Tambahan</th></tr>
                    <tr><td><code>WAITING_PAIRING</code></td><td>Server telah mengirimkan kode rahasia.</td><td><code>code</code>: Berisi 8 digit kode kombinasi.</td></tr>
                    <tr><td><code>CONNECTED</code></td><td>WhatsApp berhasil diotorisasi.</td><td>-</td></tr>
                    <tr><td><code>DISCONNECTED</code></td><td>Sesi terputus (Keluar/Dihapus paksa).</td><td>-</td></tr>
                </table>
            </div>
        </div>
    </div>

</div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'docs', 'index.html'), html);
console.log('Successfully generated complete docs/index.html');
