# RFID/RTC ESP32 Attendance Dashboard

Dashboard full-stack untuk monitoring presensi RFID dari ESP32. Backend memakai Express, Socket.IO, dan SQLite lokal. Frontend memakai React, Vite, TailwindCSS, dan Recharts.

> Gunakan Node.js 22.5+ atau Node.js 24+ agar SQLite bawaan Node (`node:sqlite`) tersedia.

## Menjalankan Project

1. Install dependency dari root project:
   ```bash
   npm install
   ```

2. Jalankan backend saja:
   ```bash
   npm run dev:server
   ```
   Backend aktif di `http://localhost:3001`.

3. Jalankan frontend saja:
   ```bash
   npm run dev:client
   ```
   Frontend aktif di `http://localhost:5173`.

4. Atau jalankan backend dan frontend bersamaan:
   ```bash
   npm run dev
   ```

Database SQLite otomatis dibuat di `server/data/attendance.sqlite`. Database mulai kosong dan akan terisi dari ESP32 atau input manual admin di menu **Data**.

## Environment

Salin `.env.example` jika ingin mengubah konfigurasi:

```bash
cp .env.example .env
```

Nilai penting:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_PATH=./data/attendance.sqlite
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
VITE_API_URL=http://localhost:3001
```

Login default:

```text
Username: admin
Password: admin123
```

Untuk frontend, jika backend bukan `localhost:3001`, buat `client/.env.local`:

```env
VITE_API_URL=http://IP_BACKEND_ANDA:3001
```

## Endpoint Backend

Login admin:

```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json
```

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Health check:

```http
GET http://localhost:3001/health
```

Kirim presensi dari ESP32:

```http
POST http://localhost:3001/api/attendance
Content-Type: application/json
```

Payload:

```json
{
  "uid": "A1B2C3D4",
  "name": "Alya Putri",
  "status": "diterima",
  "time": "07:35:12",
  "date": "2026-05-19",
  "deviceId": "ESP32-GATE-A"
}
```

Ambil data terbaru:

```http
GET http://localhost:3001/api/attendance?limit=30&sort=desc
```

Update data presensi:

```http
PUT http://localhost:3001/api/attendance/:id
Content-Type: application/json
```

Hapus data presensi:

```http
DELETE http://localhost:3001/api/attendance/:id
```

Ringkasan dashboard:

```http
GET http://localhost:3001/api/summary
```

Data presensi terakhir:

```http
GET http://localhost:3001/api/live
```

## Contoh ESP32

Endpoint mudah dibuat dari variable agar bisa diganti sesuai IP komputer/server:

```cpp
const char* ATTENDANCE_ENDPOINT = "http://192.168.1.10:3001/api/attendance";
```

Contoh sketch ESP32 sudah disiapkan di:

```text
esp32/attendance_client.ino
```

Laptop dan ESP32 harus berada di WiFi yang sama. Di kode ESP32, jangan pakai `localhost`; pakai IP laptop yang tampil di halaman **ESP32** pada dashboard.

Contoh request JSON:

```json
{
  "uid": "04AABBCCDD",
  "name": "Bima Pratama",
  "status": "diterima",
  "time": "08:12:05",
  "date": "2026-05-19",
  "deviceId": "ESP32-RFID-01"
}
```

Fallback jika server tidak tersambung: simpan payload sementara di memori/EEPROM/SD card, lalu kirim ulang saat `HTTPClient` mendapat response `201` dari server.

Status valid yang diterima backend fleksibel. Nilai seperti `accepted`, `valid`, `hadir`, atau `diterima` dinormalisasi menjadi `diterima`. Nilai seperti `rejected`, `invalid`, `gagal`, atau `ditolak` dinormalisasi menjadi `ditolak`.

