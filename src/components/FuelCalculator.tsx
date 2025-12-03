"use client";

import { useState, useEffect } from "react";
import { getSPBUList, kirimLaporanAntrian, type SPBURealtime } from "@/src/lib/supabase";

// ============================================
// TIPE DATA
// ============================================
type HasilKalkulasi = {
  id: number;
  jumlahMotor: number;
  totalMenit: number;
  jam: number;
  menit: number;
  waktuSelesai: string;
  status: string;
  warna: "hijau" | "kuning" | "merah";
  saran: string[];
  bbmTerbuang: { jam: string; liter: string; biaya: number };
  waktuSimpan: string;
};

// ============================================
// KONSTANTA
// ============================================
const PANJANG_MOTOR = 2.1; // meter
const HARGA_PERTALITE = 10000;
const KONSUMSI_BBM_IDLE = 0.1; // liter per jam

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function FuelCalculator() {
  // State untuk dark mode
  const [darkMode, setDarkMode] = useState(true);
  const [sudahMount, setSudahMount] = useState(false);

  // State untuk form input
  const [tangki, setTangki] = useState(5.5);
  const [meter, setMeter] = useState("");
  const [motor, setMotor] = useState("");
  const [kecepatan, setKecepatan] = useState(1.5);
  const [petugas, setPetugas] = useState(1);

  // State untuk hasil dan riwayat
  const [hasil, setHasil] = useState<HasilKalkulasi | null>(null);
  const [riwayat, setRiwayat] = useState<HasilKalkulasi[]>([]);

  // State untuk SPBU (crowdsource)
  const [spbuList, setSpbuList] = useState<SPBURealtime[]>([]);
  const [selectedSpbuId, setSelectedSpbuId] = useState<string>("");
  const [isSendingReport, setIsSendingReport] = useState(false);

  // ============================================
  // EFFECT: Load data saat pertama kali
  // ============================================
  useEffect(() => {
    setSudahMount(true);

    // Ambil riwayat dari localStorage
    const dataRiwayat = localStorage.getItem("riwayat");
    if (dataRiwayat) {
      setRiwayat(JSON.parse(dataRiwayat));
    }

    // Ambil tema dari localStorage
    const tema = localStorage.getItem("tema");
    if (tema === "terang") {
      setDarkMode(false);
    }

    // Load daftar SPBU dari Supabase
    const loadSpbu = async () => {
      try {
        const data = await getSPBUList();
        setSpbuList(data);
      } catch (error) {
        console.error("Error loading SPBU:", error);
      }
    };
    loadSpbu();
  }, []);

  // ============================================
  // EFFECT: Update dark mode
  // ============================================
  useEffect(() => {
    if (!sudahMount) return;

    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tema", "gelap");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tema", "terang");
    }
  }, [darkMode, sudahMount]);

  // ============================================
  // FUNGSI: Sinkronisasi meter dan motor
  // ============================================
  const ubahMeter = (nilai: string) => {
    setMeter(nilai);
    const angka = parseFloat(nilai);
    if (!isNaN(angka)) {
      setMotor(String(Math.ceil(angka / PANJANG_MOTOR)));
    } else {
      setMotor("");
    }
  };

  const ubahMotor = (nilai: string) => {
    setMotor(nilai);
    const angka = parseFloat(nilai);
    if (!isNaN(angka)) {
      setMeter((angka * PANJANG_MOTOR).toFixed(1));
    } else {
      setMeter("");
    }
  };

  // ============================================
  // FUNGSI: Kirim laporan ke Supabase
  // ============================================
  const kirimLaporan = async (jumlahMotor: number, estimasiMenit: number) => {
    if (!selectedSpbuId) return;
    
    setIsSendingReport(true);
    try {
      const success = await kirimLaporanAntrian(selectedSpbuId, jumlahMotor, estimasiMenit);
      if (success) {
        console.log("✅ Laporan berhasil dikirim!");
      }
    } catch (error) {
      console.error("Error sending report:", error);
    } finally {
      setIsSendingReport(false);
    }
  };

  // ============================================
  // FUNGSI: Hitung estimasi
  // ============================================
  const hitungEstimasi = () => {
    const jumlahMotor = parseFloat(motor);

    if (!jumlahMotor || jumlahMotor <= 0) {
      alert("Masukkan jumlah motor atau panjang antrian!");
      return;
    }

    // Hitung waktu tunggu
    const totalMenit = jumlahMotor * kecepatan * petugas;
    const jam = Math.floor(totalMenit / 60);
    const menit = Math.floor(totalMenit % 60);

    // Hitung waktu selesai
    const sekarang = new Date();
    const selesai = new Date(sekarang.getTime() + totalMenit * 60000);
    const waktuSelesai =
      selesai.getHours().toString().padStart(2, "0") +
      ":" +
      selesai.getMinutes().toString().padStart(2, "0");

    // Tentukan status dan saran
    let status = "";
    let warna: "hijau" | "kuning" | "merah" = "hijau";
    let saran: string[] = [];

    // Hitung biaya BBM
    const biayaPertalite = Math.ceil((tangki * 10000) / 5000) * 5000;
    const biayaPertamax = Math.ceil((tangki * 13500) / 5000) * 5000;
    saran.push(
      `💰 Siapkan uang: Pertalite Rp${biayaPertalite.toLocaleString()} / Pertamax Rp${biayaPertamax.toLocaleString()}`
    );

    if (totalMenit <= 45) {
      status = "AMAN";
      warna = "hijau";
      saran.push("✅ Waktu tunggu singkat, tetap di motor saja");
      saran.push("💵 Siapkan uang pas biar cepat");
    } else if (totalMenit <= 240) {
      status = "WAJAR";
      warna = "kuning";
      saran.push("🔧 Matikan mesin, gunakan standar samping");
      saran.push("📱 Manfaatkan waktu: baca atau dengar podcast");
      saran.push("👀 Waspada penyusup dari samping");
    } else {
      status = "TERLALU LAMA";
      warna = "merah";
      saran.push("❌ Pertimbangkan untuk membatalkan");
      saran.push("⛽ Cari pom bensin lain atau eceran");
      saran.push("🌅 Coba datang besok pagi subuh");
    }

    if (tangki === 5.5) {
      saran.push("🏍️ Aerox: Tidak perlu turun dari motor");
    }

    if (petugas === 2) {
      saran.push("⚠️ Petugas gantian = 2x lebih lama!");
    }

    // Hitung BBM terbuang
    const jamIdle = totalMenit / 60;
    const literTerbuang = jamIdle * KONSUMSI_BBM_IDLE;
    const biayaTerbuang = Math.ceil(literTerbuang * HARGA_PERTALITE);

    const hasilBaru: HasilKalkulasi = {
      id: Date.now(),
      jumlahMotor,
      totalMenit,
      jam,
      menit,
      waktuSelesai,
      status,
      warna,
      saran,
      bbmTerbuang: {
        jam: jamIdle.toFixed(1),
        liter: literTerbuang.toFixed(3),
        biaya: biayaTerbuang,
      },
      waktuSimpan: sekarang.toLocaleString("id-ID"),
    };

    setHasil(hasilBaru);

    // Kirim laporan ke Supabase (crowdsource)
    if (selectedSpbuId) {
      kirimLaporan(jumlahMotor, Math.floor(totalMenit));
    }
  };

  // ============================================
  // FUNGSI: Simpan ke riwayat
  // ============================================
  const simpanRiwayat = () => {
    if (!hasil) return;

    const riwayatBaru = [hasil, ...riwayat].slice(0, 10);
    setRiwayat(riwayatBaru);
    localStorage.setItem("riwayat", JSON.stringify(riwayatBaru));
    alert("✅ Tersimpan!");
  };

  // ============================================
  // FUNGSI: Bagikan hasil
  // ============================================
  const bagikanHasil = () => {
    if (!hasil) return;

    const teks = `⛽ Antrian BBM
🏍️ ${hasil.jumlahMotor} motor
⏱️ Estimasi: ${hasil.jam > 0 ? hasil.jam + " jam " : ""}${hasil.menit} menit
🕐 Giliran: Pukul ${hasil.waktuSelesai} WIB`;

    navigator.clipboard.writeText(teks);
    alert("✅ Tersalin ke clipboard!");
  };

  // ============================================
  // FUNGSI: Hapus riwayat
  // ============================================
  const hapusRiwayat = () => {
    setRiwayat([]);
    localStorage.removeItem("riwayat");
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (!sudahMount) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Memuat...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 md:p-6">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            ⛽ Kalkulator Antrian BBM
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            by Fitrah Maulana
          </p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* Pilih SPBU (untuk crowdsource) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Lokasi SPBU <span className="text-xs text-slate-400">(opsional)</span>
            </label>
            <select
              value={selectedSpbuId}
              onChange={(e) => setSelectedSpbuId(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
            >
              <option value="">-- Pilih SPBU untuk bantu update data --</option>
              {(() => {
                // Grouping SPBU by kota
                const groupedByKota: Record<string, typeof spbuList> = {};
                spbuList.forEach((spbu) => {
                  const kota = spbu.kota || "Lainnya";
                  if (!groupedByKota[kota]) {
                    groupedByKota[kota] = [];
                  }
                  groupedByKota[kota].push(spbu);
                });

                // Sort kota alphabetically
                const sortedKota = Object.keys(groupedByKota).sort();

                return sortedKota.map((kota) => {
                  // Sort SPBU dalam setiap kota secara alfabetis
                  const sortedSpbu = [...groupedByKota[kota]].sort((a, b) => 
                    a.nama.localeCompare(b.nama, 'id')
                  );

                  return (
                    <optgroup key={kota} label={`${kota} (${sortedSpbu.length} SPBU)`}>
                      {sortedSpbu.map((spbu) => {
                        // Ambil nama saja, hapus "SPBU" jika ada di awal
                        const namaClean = spbu.nama.replace(/^SPBU\s+/, "SPBU ");
                        
                        return (
                          <option key={spbu.id} value={spbu.id}>
                            {namaClean}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                });
              })()}
            </select>
            {selectedSpbuId && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Data antrian akan membantu pengguna lain
              </p>
            )}
          </div>

          {/* Jenis Motor */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Jenis Motor
            </label>
            <select
              value={tangki}
              onChange={(e) => setTangki(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
            >
              <option value={4}>Matic Kecil (Beat, Mio) - 4L</option>
              <option value={5.5}>Matic Sedang (Aerox, Vario) - 5.5L</option>
              <option value={7}>Matic Besar (Nmax, PCX) - 7L</option>
              <option value={11}>Sport (Vixion, CBR) - 11L</option>
            </select>
          </div>

          {/* Panjang Antrian */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Panjang Antrian (1 Jalur)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  value={meter}
                  onChange={(e) => ubahMeter(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 pr-10 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  m
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={motor}
                  onChange={(e) => ubahMotor(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 pr-14 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  motor
                </span>
              </div>
            </div>
          </div>

          {/* Kecepatan */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Kecepatan Layanan
            </label>
            <select
              value={kecepatan}
              onChange={(e) => setKecepatan(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
            >
              <option value={1.5}>Lancar (1.5 menit/motor)</option>
              <option value={2.5}>Sedang (2.5 menit/motor)</option>
              <option value={5}>Lambat (5 menit/motor)</option>
            </select>
          </div>

          {/* Petugas */}
          <div>
            <label className="block text-sm font-medium mb-1">Petugas</label>
            <select
              value={petugas}
              onChange={(e) => setPetugas(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
            >
              <option value={1}>1 Petugas = 1 Jalur</option>
              <option value={2}>1 Petugas = 2 Jalur (gantian)</option>
            </select>
          </div>

          {/* Tombol Hitung */}
          <button
            onClick={hitungEstimasi}
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            HITUNG ESTIMASI
          </button>
        </div>

        {/* HASIL */}
        {hasil && (
          <div className="mt-6 space-y-4">
            {/* Card Waktu - Solid background dengan gradient */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl p-5 text-center shadow-lg border border-slate-200 dark:border-slate-600">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Estimasi Waktu Tunggu
              </p>
              <p
                className={`text-4xl font-extrabold my-3 drop-shadow-sm ${
                  hasil.warna === "hijau"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : hasil.warna === "kuning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {hasil.jam > 0 && `${hasil.jam} jam `}
                {hasil.menit} menit
              </p>
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg py-2 px-4 inline-block shadow-inner">
                <p className="text-slate-700 dark:text-slate-200">
                  Giliran Anda:{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    Pukul {hasil.waktuSelesai} WIB
                  </span>
                </p>
              </div>
            </div>

            {/* Card Status - Solid dengan gradient header */}
            <div
              className={`rounded-xl overflow-hidden shadow-lg border-2 ${
                hasil.warna === "hijau"
                  ? "border-emerald-400 dark:border-emerald-600"
                  : hasil.warna === "kuning"
                  ? "border-amber-400 dark:border-amber-600"
                  : "border-rose-400 dark:border-rose-600"
              }`}
            >
              <div
                className={`p-4 text-white font-bold text-center text-lg shadow-md ${
                  hasil.warna === "hijau"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : hasil.warna === "kuning"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600"
                    : "bg-gradient-to-r from-rose-500 to-rose-600"
                }`}
              >
                🚦 STATUS: {hasil.status}
              </div>
              <div className="bg-white dark:bg-slate-800 p-4">
                <ul className="space-y-3">
                  {hasil.saran.map((s, i) => {
                    // Pisahkan emoji dan teks
                    const emoji = s.match(/^[^\w\s]+/)?.[0] || "💡";
                    const teks = s.replace(/^[^\w\s]+\s*/, "");
                    
                    // Warna berbeda untuk setiap tips
                    const warnaTips = [
                      "from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700",
                      "from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-700",
                      "from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30 border-cyan-200 dark:border-cyan-700",
                      "from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200 dark:border-orange-700",
                      "from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700",
                      "from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30 border-rose-200 dark:border-rose-700",
                    ];
                    
                    return (
                      <li
                        key={i}
                        className={`flex items-center gap-3 p-3 bg-gradient-to-r ${warnaTips[i % warnaTips.length]} rounded-xl border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-default`}
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <span className="text-2xl flex-shrink-0 animate-bounce" style={{ animationDuration: "2s", animationDelay: `${i * 200}ms` }}>
                          {emoji}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {teks}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Card BBM Terbuang - Solid dengan gradient */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-5 shadow-lg">
              <p className="font-bold text-amber-700 dark:text-amber-300 mb-3 text-lg flex items-center gap-2">
                <span className="text-2xl">⚠️</span> BBM Terbuang Saat Idle
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow border border-amber-200 dark:border-amber-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Durasi</p>
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{hasil.bbmTerbuang.jam} jam</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow border border-amber-200 dark:border-amber-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">BBM</p>
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{hasil.bbmTerbuang.liter} L</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow border border-rose-300 dark:border-rose-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Biaya</p>
                  <p className="font-bold text-lg text-rose-600 dark:text-rose-400">Rp{hasil.bbmTerbuang.biaya.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Saran hemat BBM */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-700 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                  <span className="text-2xl">🔑</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    <b>Matikan mesin</b> saat mengantri untuk hemat BBM!
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl border border-teal-200 dark:border-teal-700 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                  <span className="text-2xl">🌿</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    <b>Bebas polusi</b> - udara lebih bersih untuk semua
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all">
                  <span className="text-2xl">💡</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    <b>Mesin tetap awet</b> - idle lama bikin mesin cepat aus
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={bagikanHasil}
                className="p-3 bg-gray-200 dark:bg-slate-700 rounded-xl font-medium hover:bg-blue-500 hover:text-white transition-colors"
              >
                📤 Bagikan
              </button>
              <button
                onClick={simpanRiwayat}
                className="p-3 bg-gray-200 dark:bg-slate-700 rounded-xl font-medium hover:bg-blue-500 hover:text-white transition-colors"
              >
                💾 Simpan
              </button>
            </div>
          </div>
        )}

        {/* RIWAYAT */}
        {riwayat.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-300 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-blue-500">📋 Riwayat</h2>
              <button
                onClick={hapusRiwayat}
                className="text-xs text-red-500 hover:underline"
              >
                Hapus
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {riwayat.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setHasil(r)}
                  className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <p className="font-medium">
                    {r.jumlahMotor} motor •{" "}
                    {r.jam > 0 ? `${r.jam} jam ` : ""}
                    {r.menit} menit
                  </p>
                  <p className="text-xs text-gray-500">{r.waktuSimpan}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}
