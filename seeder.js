const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultPackages = [
    {
        nama_paket: 'Free',
        deskripsi: 'Paket dasar gratis',
        harga: 'Rp 0',
        limit_pesan: 1000,
        limit_device: 1,
        limit_autoreply: 5,
        fitur_broadcast: false,
        fitur_media: false,
        fitur_group: false,
        fitur_webhook: false,
        fitur_vcard: false,
        fitur_lokasi: false,
        fitur_polling: false,
        fitur_contact_list: false,
        fitur_group_list: false,
        fitur_inbox: false,
        is_public: true
    },
    {
        nama_paket: 'Lite',
        deskripsi: 'Paket ringan untuk pemula',
        harga: 'Rp 25.000',
        limit_pesan: 5000,
        limit_device: 1,
        limit_autoreply: 20,
        fitur_broadcast: true,
        fitur_media: true,
        fitur_group: true,
        fitur_webhook: true,
        fitur_vcard: true,
        fitur_lokasi: true,
        fitur_polling: true,
        fitur_contact_list: true,
        fitur_group_list: true,
        fitur_inbox: true,
        is_public: true
    },
    {
        nama_paket: 'Pro',
        deskripsi: 'Paket profesional untuk bisnis',
        harga: 'Rp 50.000',
        limit_pesan: 50000,
        limit_device: 3,
        limit_autoreply: 100,
        fitur_broadcast: true,
        fitur_media: true,
        fitur_group: true,
        fitur_webhook: true,
        fitur_vcard: true,
        fitur_lokasi: true,
        fitur_polling: true,
        fitur_contact_list: true,
        fitur_group_list: true,
        fitur_inbox: true,
        is_public: true
    },
    {
        nama_paket: 'Premium',
        deskripsi: 'Paket tanpa batas',
        harga: 'Rp 100.000',
        limit_pesan: -1,
        limit_device: 10,
        limit_autoreply: -1,
        fitur_broadcast: true,
        fitur_media: true,
        fitur_group: true,
        fitur_webhook: true,
        fitur_vcard: true,
        fitur_lokasi: true,
        fitur_polling: true,
        fitur_contact_list: true,
        fitur_group_list: true,
        fitur_inbox: true,
        is_public: true
    }
];

async function seed() {
    console.log("Memulai proses seeding Paket bawaan...");
    for (const pkg of defaultPackages) {
        await prisma.package.upsert({
            where: { nama_paket: pkg.nama_paket },
            update: {
                harga: pkg.harga,
                limit_pesan: pkg.limit_pesan,
                limit_device: pkg.limit_device,
                limit_autoreply: pkg.limit_autoreply,
                fitur_broadcast: pkg.fitur_broadcast,
                fitur_media: pkg.fitur_media,
                fitur_group: pkg.fitur_group,
                fitur_webhook: pkg.fitur_webhook,
                fitur_vcard: pkg.fitur_vcard,
                fitur_lokasi: pkg.fitur_lokasi,
                fitur_polling: pkg.fitur_polling,
                fitur_contact_list: pkg.fitur_contact_list,
                fitur_group_list: pkg.fitur_group_list,
                fitur_inbox: pkg.fitur_inbox
            },
            create: pkg
        });
        console.log(`Paket [${pkg.nama_paket}] berhasil disuntikkan.`);
    }
    console.log("Seeding selesai. Sistem lama aman dan siap digunakan.");
}

seed()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
