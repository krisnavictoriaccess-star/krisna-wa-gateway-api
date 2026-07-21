# Panduan Ultimate: Deploy WA Gateway ke VPS

Panduan ini dirancang khusus untuk mengubah server VPS kosong (seperti Biznet Neo Lite 2GB RAM) menjadi mesin *Enterprise* yang super kencang, stabil, dan sanggup menahan ribuan pesan (*broadcast*) tanpa mengalami *lag* atau mati mendadak.

> [!IMPORTANT]
> Sistem Operasi yang disarankan: **Ubuntu 20.04 LTS** atau **22.04 LTS**.
> Akses terminal VPS Anda menggunakan `root`.

---

## Tahap 1: Injeksi Performa (Membuat Swap RAM)
Langkah paling pertama sebelum menginstal apapun adalah memberikan "nafas buatan" untuk RAM 2GB Anda agar tidak pernah kehabisan memori. Kita akan memotong 2GB dari Disk SSD untuk dijadikan RAM cadangan.

Jalankan perintah ini satu per satu:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo sh -c 'echo "/swapfile none swap sw 0 0" >> /etc/fstab'
```
*VPS Anda kini memiliki total ruang memori (RAM + Swap) sebesar 4GB.*

---

## Tahap 2: Instalasi Persenjataan Utama
Sekarang kita instal *Node.js* (otak WhatsApp), *MySQL* (database), *Nginx* (jembatan domain), dan *PM2* (penjaga server 24 jam).

```bash
# 1. Update sistem operasi
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (Versi 20 LTS - Wajib untuk Baileys)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install MySQL Server & Nginx
sudo apt install -y mysql-server nginx

# 4. Install PM2 secara global
sudo npm install -g pm2
```

---

## Tahap 3: Meringankan Beban MySQL
Bawaan pabrik MySQL sangat rakus RAM. Kita akan membatasinya agar menyisakan banyak RAM untuk WhatsApp.

Buka konfigurasi MySQL:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```
*Scroll* ke baris paling bawah, lalu tambahkan/ketik 2 baris ini:
```ini
performance_schema = off
innodb_buffer_pool_size = 256M
```
Simpan file dengan cara: Tekan `Ctrl+X`, lalu ketik `Y`, lalu tekan `Enter`.
Setelah itu, restart MySQL:
```bash
sudo systemctl restart mysql
```

---

## Tahap 4: Membuat Database
Membuat "brankas" database sesuai permintaan Anda. Masuk ke konsol MySQL:
```bash
sudo mysql
```
Di dalam MySQL (teks akan diawali dengan `mysql>`), ketikkan perintah ini satu per satu:
```sql
CREATE DATABASE wagateway;
CREATE USER 'wa_admin'@'localhost' IDENTIFIED BY 'Krisna1927';
GRANT ALL PRIVILEGES ON wagateway.* TO 'wa_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Tahap 5: Mengunduh Source Code dari GitHub
Kita akan menarik *source code* yang sudah dibungkus rapi di GitHub ke dalam VPS Anda.

1. Pindah ke direktori utama website:
```bash
cd /var/www
```
2. Lakukan *Clone* (Pastikan repositori GitHub Anda sedang diatur ke **Public** selama beberapa menit untuk mempermudah unduhan, atau gunakan *Personal Access Token* jika Private):
```bash
git clone https://github.com/krisnavictoriaccess-star/krisna-wa-gateway-api.git
```
3. Masuk ke folder proyek Anda:
```bash
cd krisna-wa-gateway-api
```
4. Install semua *library* (Ini akan memakan waktu 1-2 menit):
```bash
npm install
```

---

## Tahap 6: Merangkai Ulang Arsitektur Prisma & .env
Ini adalah langkah paling krusial. Kita membuang sisa SQLite lokal dan mencangkokkan urat nadi MySQL.

```bash
# 1. Hapus skema SQLite lama
rm prisma/schema.prisma

# 2. Jadikan skema MySQL sebagai skema utama
mv prisma/schema.mysql.prisma prisma/schema.prisma
```

**Membuat File `.env` (Penghubung ke MySQL):**
```bash
nano .env
```
Isikan konfigurasi rahasia ini ke dalam file `.env`:
```env
DATABASE_URL="mysql://wa_admin:Krisna1927@localhost:3306/wagateway"
PORT=3000
MASTER_SECRET_KEY="krisna_rahasia_enterprise_123" 
BASE_URL="https://api.krisnadev.my.id"
```
*(Ingat: Ganti nilai `MASTER_SECRET_KEY` dengan kunci unik Anda sendiri dan JANGAN BERIKAN KEPADA SIAPAPUN).*
Simpan (Tekan `Ctrl+X`, lalu `Y`, lalu `Enter`).

**Menyuntikkan Struktur Tabel ke MySQL:**
Kita akan mendorong skema ke MySQL, men-*generate* ulang pembaca Prisma, dan menyuntikkan paket *default*!
```bash
npx prisma db push --force-reset
npx prisma generate
node seeder.js
```

---

## Tahap 7: Menghidupkan Server (Anti-Crash)
Jalankan aplikasi dengan batasan memori (500MB) agar PM2 otomatis me-*restart* jika ada indikasi kebocoran memori (Memory Leak).

> [!TIP]
> Fitur Auto-Cleanup penghapus chat usang sudah tertanam di `index.js`, Anda **TIDAK PERLU** membuat cron-job tambahan.

```bash
# Jalankan API Utama (sekaligus otomatis menjalankan Queue Worker)
pm2 start index.js --name "wagateway" --max-memory-restart 500M

# Kunci konfigurasi agar otomatis menyala jika VPS Restart/Mati Lampu
pm2 save
pm2 startup
```

---

## Tahap 8: Menyambungkan Domain & Keamanan SSL (HTTPS)
Agar API Anda terlihat profesional dan data pelanggan aman, kita akan menggunakan Nginx Reverse Proxy dan Let's Encrypt (SSL Gratis).

### 8.1. Persiapan Domain & Firewall
1. Pastikan Anda sudah masuk ke penyedia domain (seperti Niagahoster/Hostinger) dan mengarahkan **A Record** dari `api.krisnadev.my.id` ke **IP VPS Anda**.
2. Buka gerbang internet di VPS Anda agar Nginx bisa diakses:
```bash
sudo ufw allow 'Nginx Full'
```

### 8.2. Membuat Konfigurasi Nginx Dasar
Buat file jembatan (Reverse Proxy) yang murni untuk menangkap lalu lintas HTTP dan mengarahkannya ke Port 3000 aplikasi Node.js Anda:
```bash
sudo nano /etc/nginx/sites-available/wagateway
```
Tempelkan konfigurasi dasar yang bersih ini:
```nginx
server {
    listen 80;
    server_name api.krisnadev.my.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Simpan (Tekan `Ctrl+X`, ketik `Y`, lalu `Enter`).

### 8.3. Mengaktifkan Nginx
Jalankan perintah ini untuk menyalakan jembatan yang baru saja Anda buat:
```bash
sudo ln -s /etc/nginx/sites-available/wagateway /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
*(Jika muncul tulisan `syntax is ok`, berarti Nginx berhasil berjalan)*.

### 8.4. Memasang Gembok SSL (HTTPS) via Certbot
Instal alat otomatis dari Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
```
Biarkan Certbot membaca konfigurasi dasar Nginx Anda dan menyuntikkan pengaturan keamanan SSL secara otomatis:
```bash
sudo certbot --nginx -d api.krisnadev.my.id
```
*Ikuti instruksi di layar (masukkan email Anda, ketik `A` untuk setuju, dan **Pilih Opsi 2** untuk me-Redirect semua trafik HTTP ke HTTPS).*

**Selesai!** WA Gateway Enterprise Anda telah mengudara secara resmi dengan identitas `api.krisnadev.my.id`, gembok keamanan HTTPS (🔒), dan dukungan sistem Manajemen Paket Dinamis! 🎉
