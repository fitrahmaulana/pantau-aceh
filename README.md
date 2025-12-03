# 📡 Pantau Aceh

Platform crowdsourcing informasi **BBM**, **Listrik**, dan **Elpiji** dari masyarakat untuk masyarakat Aceh. Pantau kondisi terkini secara realtime!

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?logo=supabase)

## ✨ Fitur Utama

### ⚡ Info Listrik
- Laporan status listrik PLN (hidup/padam) per kota
- Update realtime dari masyarakat
- Keterangan tambahan (area padam, estimasi hidup, dll)

### 🔥 Info Elpiji
- Ketersediaan tabung gas (3kg subsidi, 5.5kg, 12kg)
- Lokasi pangkalan yang tersedia
- Info harga eceran terkini
- Status stok (tersedia/langka/kosong)

### ⛽ Info SPBU & BBM
- Stok BBM di SPBU (Pertalite, Pertamax, Solar, Dexlite)
- Status ketersediaan (tersedia/menipis/habis)
- Kendala teknis (genset rusak, batas pembelian, dll)
- Harga eceran BBM

### 🧮 Kalkulator Estimasi Antrian
- Hitung estimasi waktu tunggu berdasarkan panjang antrian
- Konversi otomatis meter ke jumlah motor
- Pilih jenis motor (kapasitas tangki berbeda)
- Estimasi BBM terbuang saat idle
- Tips & saran berdasarkan kondisi antrian

### 📍 Rekomendasi SPBU
- Daftar SPBU di Banda Aceh & Aceh Besar
- Filter berdasarkan kota
- Sort berdasarkan antrian terpendek atau traffic terlancar
- Live traffic status (Lancar/Ramai/Macet)
- Integrasi Google Maps (gratis tanpa API!)

### 📊 Crowdsource Data
- Masyarakat dapat berkontribusi melaporkan kondisi terkini
- Data terupdate secara realtime ke semua pengguna
- Log laporan dengan paginasi
- Powered by Supabase Realtime

## 🚀 Demo

Kunjungi: https://antrianbbm.netlify.app/

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Realtime)
- **Maps**: Google Maps Embed (gratis)

## 📦 Instalasi

1. Clone repository
```bash
git clone https://github.com/fitrahmaulana/pantau-aceh.git
cd pantau-aceh
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
# Buat file .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Setup database
```bash
# Jalankan SQL di Supabase SQL Editor:
# - supabase-setup.sql (data SPBU & antrian)
# - supabase-crowdsource.sql (crowdsource listrik, elpiji, SPBU)
```

5. Jalankan development server
```bash
npm run dev
```

6. Buka [http://localhost:3000](http://localhost:3000)

## 📁 Struktur Project

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── FuelCalculator.tsx      # Kalkulator estimasi antrian
│   │   ├── SPBURecommendation.tsx  # Rekomendasi SPBU + peta
│   │   ├── LaporanAntrian.tsx      # Log laporan antrian
│   │   └── CrowdsourceInfo.tsx     # Crowdsource listrik/elpiji/SPBU
│   └── lib/
│       └── supabase.ts             # Supabase client & functions
├── public/
├── supabase-setup.sql              # SQL setup SPBU & antrian
├── supabase-crowdsource.sql        # SQL setup crowdsource
└── package.json
```

## 🗄️ Database

Aplikasi ini menggunakan 2 file SQL untuk setup database:

| File | Deskripsi |
|------|-----------|
| `supabase-setup.sql` | Tabel SPBU, antrian, dan view realtime |
| `supabase-crowdsource.sql` | Tabel info listrik, elpiji, SPBU dari masyarakat |

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## 📝 Roadmap

- [ ] Validasi & moderasi laporan (anti spam)
- [ ] PWA support (offline mode)
- [ ] Push notification saat ada update penting
- [ ] Statistik & grafik historis
- [ ] Ekspansi ke kabupaten/kota lain di Aceh
- [ ] Fitur verifikasi laporan oleh komunitas

## 👨‍💻 Author

**Fitrah Maulana**
- GitHub: [@fitrahmaulana](https://github.com/fitrahmaulana)
- Location: Banda Aceh, Aceh, Indonesia

## 📄 License

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

---

💪 **Dibuat dengan ❤️ untuk membantu masyarakat Aceh**

> ⚠️ Disclaimer: Informasi dalam aplikasi ini bersumber dari crowdsource masyarakat. Mohon verifikasi ulang sebelum mengambil keputusan.

### Hasil Perhitungan dengan Fitur Lengkap
![Hasil Lengkap](https://raw.githubusercontent.com/fitrahmaulana/pantau-aceh/refs/heads/master/preview.png)
