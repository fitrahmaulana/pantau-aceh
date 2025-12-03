"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getSPBUList,
  subscribeToUpdates,
  type SPBURealtime,
} from "@/src/lib/supabase";

// ============================================
// TIPE DATA (untuk fallback)
// ============================================
type SPBU = {
  id: string;
  kode?: string;
  nama: string;
  alamat: string;
  kota: string;
  trafficStatus: "lancar" | "ramai" | "macet" | "unknown";
  antrianMotor: number;
  estimasiMenit: number;
  lat: number;
  lng: number;
  buka24Jam: boolean;
  updateTerakhir: string;
};

// ============================================
// DATA FALLBACK (jika Supabase belum ready)
// ============================================
const FALLBACK_SPBU: SPBU[] = [
  {
    id: "1",
    nama: "SPBU 14.201.102",
    alamat: "Jl. T. Nyak Arief, Darussalam",
    kota: "Banda Aceh",
    trafficStatus: "ramai",
    antrianMotor: 45,
    estimasiMenit: 60,
    lat: 5.5685,
    lng: 95.3493,
    buka24Jam: true,
    updateTerakhir: "Menunggu data...",
  },
];

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function SPBURecommendation() {
  const [spbuList, setSpbuList] = useState<SPBU[]>(FALLBACK_SPBU);
  const [selectedSPBU, setSelectedSPBU] = useState<SPBU | null>(null);
  const [filterKota, setFilterKota] = useState<string>("semua");
  const [sortBy, setSortBy] = useState<"antrian" | "traffic">("antrian");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ============================================
  // FUNGSI: Format waktu relatif (dengan fix timezone UTC)
  // ============================================
  const formatTimeAgo = (dateString: string): string => {
    // Database menyimpan dalam UTC, tambahkan 'Z' agar JavaScript parse sebagai UTC
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(utcDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return "Baru saja"; // Handle jika ada delay
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${Math.floor(diffHours / 24)} hari lalu`;
  };

  // ============================================
  // FUNGSI: Transform data dari Supabase ke format lokal
  // ============================================
  const transformSPBU = useCallback((data: SPBURealtime): SPBU => ({
    id: data.id,
    kode: data.kode,
    nama: data.nama,
    alamat: data.alamat || "",
    kota: data.kota || "",
    trafficStatus: data.traffic_status || "unknown",
    antrianMotor: data.antrian_motor || 0,
    estimasiMenit: data.estimasi_menit || 0,
    lat: Number(data.lat) || 0,
    lng: Number(data.lng) || 0,
    buka24Jam: data.buka_24_jam || false,
    updateTerakhir: data.update_terakhir
      ? formatTimeAgo(data.update_terakhir)
      : "Belum ada laporan",
  }), []);

  // ============================================
  // FUNGSI: Load data dari Supabase
  // ============================================
  const loadData = useCallback(async () => {
    try {
      const data = await getSPBUList();
      if (data.length > 0) {
        setSpbuList(data.map(transformSPBU));
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [transformSPBU]);

  // ============================================
  // EFFECT: Load data & subscribe to realtime
  // ============================================
  useEffect(() => {
    loadData();

    // Subscribe ke update realtime
    const unsubscribe = subscribeToUpdates(() => {
      loadData(); // Reload data saat ada update baru
    });

    // Refresh setiap 30 detik
    const interval = setInterval(loadData, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadData]);

  // State unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = lastUpdate;

  // ============================================
  // FUNGSI: Filter dan Sort SPBU
  // ============================================
  const getFilteredAndSortedSPBU = useCallback(() => {
    let filtered = [...spbuList];

    // Filter by kota
    if (filterKota !== "semua") {
      filtered = filtered.filter((spbu) => spbu.kota === filterKota);
    }

    // Sort
    switch (sortBy) {
      case "antrian":
        filtered.sort((a, b) => a.antrianMotor - b.antrianMotor);
        break;
      case "traffic":
        const trafficOrder = { lancar: 0, ramai: 1, macet: 2, unknown: 3 };
        filtered.sort(
          (a, b) => trafficOrder[a.trafficStatus] - trafficOrder[b.trafficStatus]
        );
        break;
    }

    return filtered;
  }, [spbuList, filterKota, sortBy]);

  // ============================================
  // FUNGSI: Warna badge traffic
  // ============================================
  const getTrafficColor = (status: SPBU["trafficStatus"]) => {
    switch (status) {
      case "lancar":
        return "bg-green-500";
      case "ramai":
        return "bg-yellow-500";
      case "macet":
        return "bg-red-500";
      default:
        return "bg-slate-400";
    }
  };

  const getTrafficText = (status: SPBU["trafficStatus"]) => {
    switch (status) {
      case "lancar":
        return "🟢 Lancar";
      case "ramai":
        return "🟡 Ramai";
      case "macet":
        return "🔴 Macet";
      default:
        return "⚪ Belum ada data";
    }
  };

  // ============================================
  // FUNGSI: Format waktu antrian
  // ============================================
  const formatWaktuAntrian = (menit: number) => {
    if (menit < 60) return `${menit} menit`;
    const jam = Math.floor(menit / 60);
    const sisaMenit = menit % 60;
    return sisaMenit > 0 ? `${jam} jam ${sisaMenit} menit` : `${jam} jam`;
  };

  // ============================================
  // FUNGSI: Buka Google Maps eksternal (GRATIS!)
  // ============================================
  const openInGoogleMaps = (spbu: SPBU) => {
    // Menggunakan Google Maps search - GRATIS tanpa API
    const query = encodeURIComponent(`${spbu.nama} ${spbu.alamat} ${spbu.kota} Aceh`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  // ============================================
  // FUNGSI: Generate embed URL (GRATIS!)
  // ============================================
  const getMapEmbedUrl = () => {
    // Menggunakan OpenStreetMap embed - 100% GRATIS!
    const lat = selectedSPBU?.lat || 5.5485;
    const lng = selectedSPBU?.lng || 95.3238;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  };

  // ============================================
  // RENDER
  // ============================================
  const filteredSPBU = getFilteredAndSortedSPBU();

  // Daftar kota unik
  const kotaList = [...new Set(spbuList.map((s) => s.kota))];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 md:p-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-red-500 to-orange-500 rounded-xl">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              📍 Info SPBU Aceh
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLoading ? "Memuat data..." : `${spbuList.length} SPBU • Realtime`}
            </p>
          </div>
        </div>
        
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
        </div>
      </div>

      {/* Alert Krisis */}
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <div className="flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Info Krisis BBM Aceh
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Pasokan terbatas. Gunakan estimator untuk menghemat waktu Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Filter dan Sort */}
      <div className="flex gap-2 mb-4">
        <select
          value={filterKota}
          onChange={(e) => setFilterKota(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="semua">Semua Kota</option>
          {kotaList.map((kota) => (
            <option key={kota} value={kota}>
              {kota}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="antrian">Antrian Terpendek</option>
          <option value="traffic">Traffic Terlancar</option>
        </select>
      </div>

      {/* Peta OpenStreetMap - GRATIS! */}
      <div className="relative mb-4 rounded-xl overflow-hidden shadow-md">
        <iframe
          src={getMapEmbedUrl()}
          width="100%"
          height="200"
          style={{ border: 0 }}
          loading="lazy"
          className="w-full"
          title="Peta SPBU Aceh"
        />

        {/* Overlay info */}
        {selectedSPBU && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                  {selectedSPBU.nama}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {selectedSPBU.alamat}
                </p>
              </div>
              <button
                onClick={() => openInGoogleMaps(selectedSPBU)}
                className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Maps
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" /> Lancar
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Ramai
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full" /> Macet
        </span>
      </div>

      {/* Daftar SPBU */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent" />
            <p className="text-sm text-slate-500">Memuat data SPBU...</p>
          </div>
        ) : filteredSPBU.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Tidak ada SPBU ditemukan</p>
          </div>
        ) : (
          filteredSPBU.map((spbu) => (
          <div
            key={spbu.id}
            onClick={() => setSelectedSPBU(spbu)}
            className={`p-3 rounded-xl cursor-pointer transition-all ${
              selectedSPBU?.id === spbu.id
                ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                : "bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-600"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold text-white rounded ${getTrafficColor(
                      spbu.trafficStatus
                    )}`}
                  >
                    {getTrafficText(spbu.trafficStatus)}
                  </span>
                  {spbu.buka24Jam && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded">
                      24 Jam
                    </span>
                  )}
                </div>

                {/* Nama & Alamat */}
                <h4 className="font-semibold text-sm text-slate-800 dark:text-white">
                  {spbu.nama}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {spbu.alamat}, {spbu.kota}
                </p>

                {/* Info Antrian */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    🏍️ {spbu.antrianMotor} motor
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    ⏱️ ~{formatWaktuAntrian(spbu.estimasiMenit)}
                  </span>
                </div>

                {/* Update terakhir */}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  📡 Update: {spbu.updateTerakhir}
                </p>
              </div>

              {/* Estimasi Waktu - Highlight */}
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimasi Antrian
                </p>
                <p className={`font-bold text-lg ${
                  spbu.estimasiMenit <= 30 ? "text-green-600 dark:text-green-400" :
                  spbu.estimasiMenit <= 90 ? "text-yellow-600 dark:text-yellow-400" :
                  "text-red-600 dark:text-red-400"
                }`}>
                  {spbu.estimasiMenit <= 60 
                    ? `${spbu.estimasiMenit}m`
                    : `${Math.floor(spbu.estimasiMenit / 60)}j`
                  }
                </p>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Footer - Kontribusi */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          💪 Dibuat untuk membantu masyarakat Aceh
        </p>
        <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-1">
          Data antrian bersifat estimasi. Bantu update via komunitas.
        </p>
      </div>
    </div>
  );
}
