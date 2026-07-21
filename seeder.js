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
                fitur_webhook: pkg.fitur_webhook
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
