# 🛢️ Kalkulator Antrian BBM Aceh

Aplikasi web untuk membantu masyarakat Aceh memperkirakan waktu antrian BBM di tengah krisis BBM. Dilengkapi dengan fitur **crowdsource data antrian**, **rekomendasi SPBU terdekat**, dan **live traffic update** secara realtime.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?logo=supabase)

## ✨ Fitur

### 🧮 Kalkulator Estimasi Antrian
- Hitung estimasi waktu tunggu berdasarkan panjang antrian
- Konversi otomatis meter ke jumlah motor
- Pilih jenis motor (kapasitas tangki berbeda)
- Estimasi BBM terbuang saat idle
- Tips & saran berdasarkan kondisi antrian

### 📍 Rekomendasi SPBU
- Daftar SPBU di seluruh Aceh
- Filter berdasarkan kota
- Sort berdasarkan antrian terpendek atau traffic terlancar
- Live traffic status (Lancar/Ramai/Macet)
- Integrasi OpenStreetMap (gratis!)
- Link langsung ke Google Maps

### 📊 Crowdsource Data Antrian
- User dapat berkontribusi melaporkan kondisi antrian
- Data terupdate secara realtime ke semua pengguna
- Log laporan terbaru dalam bentuk tabel
- Powered by Supabase Realtime

## 🚀 Demo

Kunjungi: [Coming Soon]

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Realtime)
- **Maps**: OpenStreetMap (embed gratis)

## 📦 Instalasi

1. Clone repository
```bash
git clone https://github.com/fitrahmaulana/kalkulator-bbm-aceh.git
cd kalkulator-bbm-aceh
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables (opsional jika ingin pakai Supabase sendiri)
```bash
# Buat file .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Jalankan development server
```bash
npm run dev
```

5. Buka [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup (Supabase)

Jika ingin menggunakan Supabase sendiri, jalankan SQL di file `supabase-setup.sql` pada Supabase SQL Editor.

## 📁 Struktur Project

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── FuelCalculator.tsx    # Komponen kalkulator utama
│   │   ├── SPBURecommendation.tsx # Komponen rekomendasi SPBU
│   │   └── LaporanAntrian.tsx    # Komponen log laporan
│   └── lib/
│       └── supabase.ts           # Supabase client & functions
├── public/
├── supabase-setup.sql            # SQL setup database
└── package.json
```

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## 📝 Todo

- [ ] Validasi crowdsource (batasi spam)
- [ ] Notifikasi saat laporan berhasil dikirim
- [ ] PWA support (offline mode)
- [ ] Statistik & grafik antrian
- [ ] Form admin untuk moderasi

## 👨‍💻 Author

**Fitrah Maulana**
- GitHub: [@fitrahmaulana](https://github.com/fitrahmaulana)
- Location: Banda Aceh, Aceh, Indonesia

## 📄 License

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

---

💪 **Dibuat dengan ❤️ untuk membantu masyarakat Aceh**
