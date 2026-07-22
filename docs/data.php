<?php
$endpoints = [
    [
        'id' => 'GETapikeylist',
        'category' => '👑 Admin / Master (Manajemen API Key)',
        'method' => 'GET',
        'path' => '/api-key/list',
        'summary' => 'Melihat daftar semua akun klien (API Key) yang terdaftar di database.',
        'badge' => 'master',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": [
    {
      \\"key\\": \\"KEY-ABC123DEF456\\",
      \\"label\\": \\"Toko Utama\\",
      \\"paket\\": \\"Premium\\",
      \\"limit_pesan\\": 50000,
      \\"terpakai_bulan_ini\\": 1500,
      \\"sisa_kuota\\": 48500,
      \\"status\\": \\"active\\",
      \\"expired_at\\": \\"2026-12-31T23:59:59Z\\"
    }
  ]
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Akses ditolak. Master Key salah atau tidak ditemukan.\\"
}'
    ],
    [
        'id' => 'GETpackagelist',
        'category' => '',
        'method' => 'GET',
        'path' => '/package/list',
        'summary' => 'Mengambil daftar seluruh paket SASS/harga yang tersedia di database (Dynamic Packages).',
        'badge' => 'master',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": [
    { \\"id\\": 1, \\"nama_paket\\": \\"Premium\\", \\"limit_pesan\\": 500000, \\"is_public\\": true }
  ]
}',
        'resError' => ''
    ],
    [
        'id' => 'POSTpackageadd',
        'category' => '',
        'method' => 'POST',
        'path' => '/package/add',
        'summary' => 'Menambahkan paket layanan baru ke dalam sistem.',
        'badge' => 'master',
        'params' => [
            ['field' => 'nama_paket', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nama paket unik, contoh: Promo Ramadhan.'],
            ['field' => 'limit_pesan', 'type' => 'Integer', 'status' => 'wajib', 'desc' => 'Batas pesan bulanan.'],
            ['field' => 'limit_device', 'type' => 'Integer', 'status' => 'opsional', 'desc' => 'Maksimal device.'],
            ['field' => 'fitur_broadcast', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim massal (broadcast).'],
            ['field' => 'fitur_media', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan pengiriman media (gambar, video, dokumen).'],
            ['field' => 'fitur_group', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim ke grup.'],
            ['field' => 'fitur_webhook', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan fitur integrasi webhook.'],
            ['field' => 'fitur_vcard', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim vCard (Kontak).'],
            ['field' => 'fitur_lokasi', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim lokasi (Maps).'],
            ['field' => 'fitur_polling', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim polling (Voting).'],
            ['field' => 'fitur_contact_list', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan melihat daftar kontak HP.'],
            ['field' => 'fitur_group_list', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan melihat daftar grup WA.'],
            ['field' => 'fitur_inbox', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan melihat inbox/pesan masuk.'],
        ],
        'reqBody' => '{
  \\"nama_paket\\": \\"Promo Spesial\\",
  \\"limit_pesan\\": 100000,
  \\"limit_device\\": 2,
  \\"fitur_media\\": true
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Paket berhasil ditambahkan.\\",
  \\"data\\": { ... }
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Paket dengan nama tersebut sudah ada.\\"
}'
    ],
    [
        'id' => 'POSTpackageedit',
        'category' => '',
        'method' => 'POST',
        'path' => '/package/edit',
        'summary' => 'Mengubah spesifikasi paket atau menyembunyikan paket dari publik.',
        'badge' => 'master',
        'params' => [
            ['field' => 'id', 'type' => 'Integer', 'status' => 'wajib', 'desc' => 'ID paket yang ingin diubah.'],
            ['field' => 'is_public', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Atur false untuk menyembunyikan paket dari publik.'],
            ['field' => 'limit_pesan', 'type' => 'Integer', 'status' => 'opsional', 'desc' => 'Batas pesan bulanan (-1 untuk unlimited).'],
            ['field' => 'limit_device', 'type' => 'Integer', 'status' => 'opsional', 'desc' => 'Batas maksimal koneksi device.'],
            ['field' => 'limit_autoreply', 'type' => 'Integer', 'status' => 'opsional', 'desc' => 'Batas jumlah auto-reply.'],
            ['field' => 'fitur_broadcast', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim massal (broadcast).'],
            ['field' => 'fitur_media', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan pengiriman media.'],
            ['field' => 'fitur_group', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim ke grup.'],
            ['field' => 'fitur_webhook', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan integrasi webhook.'],
            ['field' => 'fitur_vcard', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim vCard (Kontak).'],
            ['field' => 'fitur_lokasi', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim lokasi (Maps).'],
            ['field' => 'fitur_polling', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan kirim polling.'],
            ['field' => 'fitur_contact_list', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan melihat kontak.'],
            ['field' => 'fitur_group_list', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan melihat grup.'],
            ['field' => 'fitur_inbox', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Izinkan melihat pesan masuk.'],
        ],
        'reqBody' => '{
  \\"id\\": 1,
  \\"limit_pesan\\": 999999,
  \\"is_public\\": false
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Paket berhasil diperbarui.\\",
  \\"data\\": { ... }
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Paket tidak ditemukan.\\"
}'
    ],
    [
        'id' => 'POSTpackagedelete',
        'category' => '',
        'method' => 'POST',
        'path' => '/package/delete',
        'summary' => 'Menghapus paket secara fisik (Hard Delete) dari database.',
        'badge' => 'master',
        'params' => [
            ['field' => 'id', 'type' => 'Integer', 'status' => 'wajib', 'desc' => 'ID paket yang ingin dihapus.'],
        ],
        'reqBody' => '{
  \\"id\\": 1
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Paket berhasil dihapus permanen dari database.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"ID Paket tidak valid.\\"
}'
    ],
    [
        'id' => 'POSTapikeygenerate',
        'category' => '',
        'method' => 'POST',
        'path' => '/api-key/generate',
        'summary' => 'Membuat kredensial API Key baru untuk klien.',
        'badge' => 'master',
        'params' => [
            ['field' => 'paket', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Pilihan: Free, Lite, Pro, Premium. Default: Free.'],
            ['field' => 'label', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Nama atau identitas klien. Default: User.'],
            ['field' => 'expiry_days', 'type' => 'Integer', 'status' => 'opsional', 'desc' => 'Masa aktif dalam hitungan hari. Default: 30.'],
        ],
        'reqBody' => '{
  \\"paket\\": \\"Pro\\",
  \\"label\\": \\"Klien VIP\\",
  \\"expiry_days\\": 365
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"API Key berhasil dibuat.\\",
  \\"plain_key\\": \\"KEY-XXXXYYYYZZZZ\\",
  \\"data\\": { ... }
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Paket tidak valid.\\"
}'
    ],
    [
        'id' => 'POSTapikeyextend',
        'category' => '',
        'method' => 'POST',
        'path' => '/api-key/extend',
        'summary' => 'Menambahkan masa aktif (hari) pada klien yang sudah ada.',
        'badge' => 'master',
        'params' => [
            ['field' => 'target_api_key', 'type' => 'String', 'status' => 'wajib', 'desc' => 'API Key milik klien yang akan diperpanjang.'],
            ['field' => 'tambah_hari', 'type' => 'Integer', 'status' => 'wajib', 'desc' => 'Jumlah hari yang akan ditambahkan ke masa aktif.'],
        ],
        'reqBody' => '{
  \\"target_api_key\\": \\"KEY-XXXXYYYYZZZZ\\",
  \\"tambah_hari\\": 30
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Masa aktif berhasil diperpanjang.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"API Key tidak ditemukan.\\"
}'
    ],
    [
        'id' => 'POSTapikeyupgrade',
        'category' => '',
        'method' => 'POST',
        'path' => '/api-key/upgrade',
        'summary' => 'Mengubah tipe paket atau limit pesan bulanan klien.',
        'badge' => 'master',
        'params' => [
            ['field' => 'target_api_key', 'type' => 'String', 'status' => 'wajib', 'desc' => 'API Key target.'],
            ['field' => 'nama_paket', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Paket baru (Free, Lite, Pro, Premium).'],
        ],
        'reqBody' => '{
  \\"target_api_key\\": \\"KEY-XXXXYYYYZZZZ\\",
  \\"nama_paket\\": \\"Premium\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Paket API Key berhasil di-upgrade ke Premium.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Gagal melakukan upgrade. Paket tidak valid.\\"
}'
    ],
    [
        'id' => 'POSTapikeydelete',
        'category' => '',
        'method' => 'POST',
        'path' => '/api-key/delete',
        'summary' => 'Menghapus klien secara permanen dari server.',
        'badge' => 'master',
        'params' => [
            ['field' => 'target_api_key', 'type' => 'String', 'status' => 'wajib', 'desc' => 'API Key target yang akan dihapus.'],
        ],
        'reqBody' => '{
  \\"target_api_key\\": \\"KEY-XXXXYYYYZZZZ\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"API Key berhasil dihapus permanen.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"API Key tidak ditemukan di database.\\"
}'
    ],
    [
        'id' => 'GETdeviceall',
        'category' => '',
        'method' => 'GET',
        'path' => '/device/all',
        'summary' => 'Memantau seluruh sesi perangkat WhatsApp dari SEMUA pengguna di server.',
        'badge' => 'master',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"total_devices\\": 2,
  \\"data\\": [
    { \\"device\\": \\"628111\\", \\"status\\": \\"CONNECTED\\" },
    { \\"device\\": \\"628222\\", \\"status\\": \\"DISCONNECTED\\" }
  ]
}',
        'resError' => '{ \\"status\\": false, \\"message\\": \\"Unauthorized\\" }'
    ],
    [
        'id' => 'GETqueueall',
        'category' => '',
        'method' => 'GET',
        'path' => '/queue/all',
        'summary' => 'Memantau lalu lintas seluruh antrean pesan server secara global.',
        'badge' => 'master',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"global_queue_count\\": 154,
  \\"queues\\": [ ... ]
}',
        'resError' => '{ \\"status\\": false, \\"message\\": \\"Unauthorized\\" }'
    ],
    [
        'id' => 'GETapikeyinfo',
        'category' => '👤 Informasi Klien (API Key)',
        'method' => 'GET',
        'path' => '/api-key/info',
        'summary' => 'Mengecek sisa kuota, limit, dan masa tenggang API Key Anda sendiri.',
        'badge' => 'user',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": {
    \\"paket\\": \\"Pro\\",
    \\"status\\": \\"active\\",
    \\"limit_pesan\\": 50000,
    \\"terpakai_bulan_ini\\": 1520,
    \\"sisa_kuota\\": 48480,
    \\"expired_at\\": \\"2026-08-15T12:00:00Z\\"
  }
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"API Key tidak valid atau sudah kadaluarsa.\\"
}'
    ],
    [
        'id' => 'POSTdeviceadd',
        'category' => '📱 Device Management (Sesi WA)',
        'method' => 'POST',
        'path' => '/device/add',
        'summary' => 'Menyambungkan nomor WhatsApp ke server untuk mendapatkan Pairing Code.',
        'badge' => 'user',
        'params' => [
            ['field' => 'nomor_device', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nomor HP WA Anda beserta kode negara tanpa \\'+\\' (contoh: 628xxx).'],
        ],
        'reqBody' => '{
  \\"nomor_device\\": \\"628123456789\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Silakan masukkan kode pairing ini di WhatsApp.\\",
  \\"pairing_code\\": \\"V5Y2A9XR\\",
  \\"device_status\\": \\"WAITING_PAIRING\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Nomor HP tidak valid.\\"
}'
    ],
    [
        'id' => 'GETdevicelist',
        'category' => '',
        'method' => 'GET',
        'path' => '/device/list',
        'summary' => 'Melihat daftar perangkat/nomor WhatsApp milik Anda yang tersambung di server.',
        'badge' => 'user',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": [
    { \\"device\\": \\"628123456789\\", \\"status\\": \\"CONNECTED\\" }
  ]
}',
        'resError' => '{ \\"status\\": false, \\"message\\": \\"API Key tidak valid.\\" }'
    ],
    [
        'id' => 'POSTdevicesettings',
        'category' => '',
        'method' => 'POST',
        'path' => '/device/settings',
        'summary' => 'Mengubah pengaturan otomatisasi pada perangkat spesifik.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'wajib', 'desc' => 'Nomor device Anda di HTTP Header.'],
            ['field' => 'is_autoread', 'type' => 'Boolean', 'status' => 'wajib', 'desc' => 'Aktifkan atau matikan fitur membaca/centang biru otomatis (true/false).'],
        ],
        'reqBody' => '{
  \\"is_autoread\\": true
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Pengaturan perangkat berhasil diperbarui.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Device tidak ditemukan atau Anda tidak memiliki akses.\\"
}'
    ],
    [
        'id' => 'POSTdevicedelete',
        'category' => '',
        'method' => 'POST',
        'path' => '/device/delete',
        'summary' => 'Logout dan putuskan sambungan WhatsApp Anda dari server secara paksa.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'wajib', 'desc' => 'Nomor device yang akan dilogout di HTTP Header.'],
        ],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Sesi WhatsApp berhasil dihapus dan dilogout.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Gagal menghapus sesi.\\"
}'
    ],
    [
        'id' => 'GETcontactlist',
        'category' => '📇 Kontak & Data',
        'method' => 'GET',
        'path' => '/contact/list',
        'summary' => 'Mengambil daftar kontak (nomor dan nama) yang tersimpan di HP Anda.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'wajib', 'desc' => 'Nomor HP/device Anda di HTTP Header.'],
        ],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": [
    { \\"id\\": \\"628111@s.whatsapp.net\\", \\"name\\": \\"Budi Santoso\\", \\"notify\\": \\"Budi\\" }
  ]
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Device tidak terhubung.\\"
}'
    ],
    [
        'id' => 'GETgrouplist',
        'category' => '',
        'method' => 'GET',
        'path' => '/group/list',
        'summary' => 'Mengambil daftar ID Grup tempat Anda bergabung (dibutuhkan untuk kirim pesan grup).',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'wajib', 'desc' => 'Nomor HP/device Anda di HTTP Header.'],
        ],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": [
    { \\"id\\": \\"1234567890@g.us\\", \\"subject\\": \\"Grup Keluarga Besar\\" }
  ]
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Device tidak terhubung.\\"
}'
    ],
    [
        'id' => 'GETinbox',
        'category' => '',
        'method' => 'GET',
        'path' => '/inbox',
        'summary' => 'Melihat semua pesan teks yang masuk ke WhatsApp Anda secara otomatis (seluruh pesan akan tersimpan tanpa syarat).',
        'badge' => 'user',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": [
    { \\"from\\": \\"628111@s.whatsapp.net\\", \\"message\\": \\"Halo, barang ready?\\", \\"timestamp\\": 1718000000 }
  ]
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Gagal mengambil inbox.\\"
}'
    ],
    [
        'id' => 'POSTwebhookset',
        'category' => '🤖 Webhooks & Auto-Reply',
        'method' => 'POST',
        'path' => '/webhook/set',
        'summary' => 'Mengatur URL sistem/server Anda sendiri untuk menerima notifikasi pesan masuk secara Real-Time.',
        'badge' => 'user',
        'params' => [
            ['field' => 'webhook_url', 'type' => 'String', 'status' => 'wajib', 'desc' => 'URL publik server Anda yang akan menerima POST request.'],
        ],
        'reqBody' => '{
  \\"webhook_url\\": \\"https://server-anda.com/api/wa-callback\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Webhook URL berhasil disimpan.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"URL tidak valid.\\"
}'
    ],
    [
        'id' => 'POSTautoreplyadd',
        'category' => '',
        'method' => 'POST',
        'path' => '/auto-reply/add',
        'summary' => 'Membuat robot balasan otomatis berdasarkan kata kunci spesifik.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'wajib', 'desc' => 'Nomor device/bot yang akan merespon diletakkan di HTTP Header.'],
            ['field' => 'keyword', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Kata pemicu.'],
            ['field' => 'response', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Balasan yang akan dikirim bot.'],
            ['field' => 'match_type', 'type' => 'String', 'status' => 'opsional', 'desc' => 'exact (sama persis) / contains (mengandung). Default: exact.'],
            ['field' => 'media_url', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Tautan URL publik untuk mengirim gambar/video/dokumen bersamaan dengan respon.'],
            ['field' => 'media_type', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Tipe file media (contoh: image, video, document).'],
        ],
        'reqBody' => '{
  \\"keyword\\": \\"harga\\",
  \\"response\\": \\"Berikut adalah daftar harga kami:\\",
  \\"match_type\\": \\"exact\\",
  \\"media_url\\": \\"https://domain.com/brosur.jpg\\",
  \\"media_type\\": \\"image\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Auto-Reply berhasil ditambahkan.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Keyword atau response tidak boleh kosong.\\"
}'
    ],
    [
        'id' => 'GETautoreplylist',
        'category' => '',
        'method' => 'GET',
        'path' => '/auto-reply/list',
        'summary' => 'Melihat daftar seluruh aturan Auto-Reply yang telah Anda buat.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'wajib', 'desc' => 'Nomor HP/device Anda di HTTP Header.'],
        ],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"data\\": [
    { \\"keyword\\": \\"ping\\", \\"response\\": \\"pong!\\", \\"match_type\\": \\"exact\\" }
  ]
}',
        'resError' => '{ \\"status\\": false, \\"message\\": \\"Gagal mengambil data.\\" }'
    ],
    [
        'id' => 'POSTautoreplydelete',
        'category' => '',
        'method' => 'POST',
        'path' => '/auto-reply/delete',
        'summary' => 'Menghapus salah satu kata kunci Auto-Reply.',
        'badge' => 'user',
        'params' => [
            ['field' => 'id', 'type' => 'Integer', 'status' => 'wajib', 'desc' => 'ID Auto-Reply yang akan dihapus.'],
        ],
        'reqBody' => '{
  \\"id\\": 12
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Auto-Reply berhasil dihapus.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Auto-Reply tidak ditemukan.\\"
}'
    ],
    [
        'id' => 'POSTkirimpesan',
        'category' => '✉️ Messaging (Pengiriman)',
        'method' => 'POST',
        'path' => '/kirim-pesan',
        'summary' => 'Mengirim pesan teks ke satu nomor.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'opsional', 'desc' => 'Nomor device/pengirim di HTTP Header. Kosongkan untuk mode Rotator otomatis.'],
            ['field' => 'nomor', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nomor tujuan (628xxx).'],
            ['field' => 'pesan', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Isi pesan teks.'],
            ['field' => 'media_url', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Tautan/URL gambar jika ingin mengirim pesan gambar.'],
            ['field' => 'media_type', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Tipe media (saat ini mendukung image, video, document).'],
            ['field' => 'send_at', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30).'],
        ],
        'reqBody' => '{
  \\"nomor\\": \\"628123456789\\",
  \\"pesan\\": \\"Halo bosku!\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Pesan berhasil dimasukkan ke antrean pengiriman.\\",
  \\"queue_id\\": 150
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Kuota pesan Anda habis.\\"
}'
    ],
    [
        'id' => 'POSTkirimmassal',
        'category' => '',
        'method' => 'POST',
        'path' => '/kirim-massal',
        'summary' => 'Mengirim broadcast ke banyak nomor sekaligus menggunakan sistem antrean anti-banned.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'opsional', 'desc' => 'Nomor device/pengirim di HTTP Header. Kosongkan untuk mode Rotator otomatis.'],
            ['field' => 'pesan_list', 'type' => 'Array', 'status' => 'wajib', 'desc' => 'Daftar objek tujuan dan pesannya. Anda bisa menyisipkan properti media_url (opsional) di setiap objek jika paket Anda mendukung fitur_media.'],
            ['field' => 'send_at', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30).'],
        ],
        'reqBody' => '{
  \\"pesan_list\\": [
    { \\"nomor\\": \\"628111\\", \\"pesan\\": \\"Pesan 1\\" },
    { \\"nomor\\": \\"628222\\", \\"pesan\\": \\"Pesan 2\\" }
  ]
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"2 pesan berhasil dimasukkan ke antrean massal.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Format data tidak valid, harus berupa array.\\"
}'
    ],
    [
        'id' => 'POSTkirimmedia',
        'category' => '',
        'method' => 'POST',
        'path' => '/kirim-media',
        'summary' => 'Mengirim dokumen, gambar, atau video berdasarkan tautan publik.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'opsional', 'desc' => 'Nomor device/pengirim di HTTP Header. Kosongkan untuk mode Rotator otomatis.'],
            ['field' => 'nomor', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nomor tujuan.'],
            ['field' => 'url', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Tautan/URL publik file Anda.'],
            ['field' => 'tipe', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Tipe file: image, video, document.'],
            ['field' => 'caption', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Keterangan/teks pendamping gambar/video.'],
            ['field' => 'send_at', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30).'],
        ],
        'reqBody' => '{
  \\"nomor\\": \\"628123456789\\",
  \\"url\\": \\"https://domain.com/brosur.pdf\\",
  \\"tipe\\": \\"document\\",
  \\"caption\\": \\"Ini brosur bulan ini.\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Pesan media berhasil masuk antrean.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Media URL tidak dapat diakses.\\"
}'
    ],
    [
        'id' => 'POSTkirimgrup',
        'category' => '',
        'method' => 'POST',
        'path' => '/kirim-grup',
        'summary' => 'Mengirim pesan teks ke dalam Grup WhatsApp.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'opsional', 'desc' => 'Nomor device/pengirim di HTTP Header. Kosongkan untuk mode Rotator otomatis.'],
            ['field' => 'group_id', 'type' => 'String', 'status' => 'wajib', 'desc' => 'ID Grup (diperoleh dari endpoint /group/list).'],
            ['field' => 'pesan', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Isi pesan teks.'],
            ['field' => 'send_at', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30).'],
        ],
        'reqBody' => '{
  \\"group_id\\": \\"1234567890-123456@g.us\\",
  \\"pesan\\": \\"Halo member grup!\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Pesan berhasil masuk antrean grup.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Group ID tidak valid.\\"
}'
    ],
    [
        'id' => 'POSTkirimpolling',
        'category' => '',
        'method' => 'POST',
        'path' => '/kirim-polling',
        'summary' => 'Mengirimkan formulir interaktif (Voting/Polling).',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'opsional', 'desc' => 'Nomor device/pengirim di HTTP Header. Kosongkan untuk mode Rotator otomatis.'],
            ['field' => 'nomor', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nomor tujuan.'],
            ['field' => 'nama_polling', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Judul pertanyaan polling.'],
            ['field' => 'opsi', 'type' => 'Array', 'status' => 'wajib', 'desc' => 'Pilihan jawaban (minimal 2).'],
            ['field' => 'multiple_choice', 'type' => 'Boolean', 'status' => 'opsional', 'desc' => 'Apabila true, user bisa memilih lebih dari satu opsi. Default: false.'],
            ['field' => 'send_at', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30).'],
        ],
        'reqBody' => '{
  \\"nomor\\": \\"628123456789\\",
  \\"nama_polling\\": \\"Berapa umur Anda?\\",
  \\"opsi\\": [\\"18-25\\", \\"26-35\\", \\"35+\\"],
  \\"multiple_choice\\": false
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Polling berhasil dikirim.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Values polling minimal harus berisi 2 opsi.\\"
}'
    ],
    [
        'id' => 'POSTkirimlokasi',
        'category' => '',
        'method' => 'POST',
        'path' => '/kirim-lokasi',
        'summary' => 'Mengirimkan pin koordinat peta (Google Maps).',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'opsional', 'desc' => 'Nomor device/pengirim di HTTP Header. Kosongkan untuk mode Rotator otomatis.'],
            ['field' => 'nomor', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nomor tujuan.'],
            ['field' => 'lat', 'type' => 'Number', 'status' => 'wajib', 'desc' => 'Latitude (Garis Lintang).'],
            ['field' => 'long', 'type' => 'Number', 'status' => 'wajib', 'desc' => 'Longitude (Garis Bujur).'],
            ['field' => 'send_at', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30).'],
        ],
        'reqBody' => '{
  \\"nomor\\": \\"628123456789\\",
  \\"lat\\": -6.200000,
  \\"long\\": 106.816666
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Pesan lokasi berhasil dikirim.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Latitude dan Longitude wajib diisi dengan angka.\\"
}'
    ],
    [
        'id' => 'POSTkirimvcard',
        'category' => '',
        'method' => 'POST',
        'path' => '/kirim-vcard',
        'summary' => 'Mengirimkan kartu kontak.',
        'badge' => 'user',
        'params' => [
            ['field' => 'sender_id', 'type' => 'String (Header)', 'status' => 'opsional', 'desc' => 'Nomor device/pengirim di HTTP Header. Kosongkan untuk mode Rotator otomatis.'],
            ['field' => 'nomor', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nomor penerima pesan.'],
            ['field' => 'nama_kontak', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nama kontak yang akan dibagikan.'],
            ['field' => 'nomor_kontak', 'type' => 'String', 'status' => 'wajib', 'desc' => 'Nomor telepon kontak yang akan dibagikan.'],
            ['field' => 'send_at', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30).'],
        ],
        'reqBody' => '{
  \\"nomor\\": \\"628123456789\\",
  \\"nama_kontak\\": \\"CS Support\\",
  \\"nomor_kontak\\": \\"+628111222333\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Kontak VCard berhasil dikirim.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Parameter kontak tidak lengkap.\\"
}'
    ],
    [
        'id' => 'GETqueuemy',
        'category' => '⏳ Manajemen Antrean (Queue)',
        'method' => 'GET',
        'path' => '/queue/my',
        'summary' => 'Memantau status seluruh antrean pesan milik Anda (Pending/Sukses/Gagal).',
        'badge' => 'user',
        'params' => [],
        'reqBody' => '',
        'resSuccess' => '{
  \\"status\\": true,
  \\"pending\\": 5,
  \\"success\\": 250,
  \\"failed\\": 2
}',
        'resError' => '{ \\"status\\": false, \\"message\\": \\"Gagal memuat antrean.\\" }'
    ],
    [
        'id' => 'POSTqueuecancel',
        'category' => '',
        'method' => 'POST',
        'path' => '/queue/cancel',
        'summary' => 'Membatalkan seluruh pesan di antrean yang belum sempat terkirim.',
        'badge' => 'user',
        'params' => [
            ['field' => 'device', 'type' => 'String', 'status' => 'opsional', 'desc' => 'Nomor pengirim jika ingin membatalkan antrean pada device tertentu.'],
        ],
        'reqBody' => '{
  \\"device\\": \\"628123456789\\"
}',
        'resSuccess' => '{
  \\"status\\": true,
  \\"message\\": \\"Antrean berhasil dibatalkan.\\"
}',
        'resError' => '{
  \\"status\\": false,
  \\"message\\": \\"Queue ID tidak ditemukan atau sudah diproses.\\"
}'
    ],
];
?>