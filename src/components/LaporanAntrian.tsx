"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/src/lib/supabase";

// ============================================
// TIPE DATA
// ============================================
type Laporan = {
  id: string;
  spbu_id: string;
  spbu_nama: string;
  spbu_kota: string;
  jumlah_motor: number;
  estimasi_menit: number;
  traffic_status: "lancar" | "ramai" | "macet";
  created_at: string;
};

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function LaporanAntrian() {
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(laporanList.length / itemsPerPage);
  
  // Hitung data yang ditampilkan berdasarkan halaman
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedList = laporanList.slice(startIndex, startIndex + itemsPerPage);

  // ============================================
  // FUNGSI: Format waktu (tanggal dan jam)
  // ============================================
  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "Tidak tersedia";
    
    try {
      // Parse langsung tanpa modifikasi
      const date = new Date(dateString);
      
      // Validasi apakah date valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date string:", dateString);
        return "Tidak tersedia";
      }
      
      // Format: "04 Des, 15:30"
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Tidak tersedia";
    }
  };

  // ============================================
  // FUNGSI: Load laporan dari Supabase
  // ============================================
  const loadLaporan = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("laporan_antrian")
        .select(`
          id,
          spbu_id,
          jumlah_motor,
          estimasi_menit,
          traffic_status,
          created_at,
          spbu:spbu_id (
            nama,
            kota
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching laporan:", error);
        return;
      }

      if (data) {
        const formattedData: Laporan[] = data.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          spbu_id: item.spbu_id as string,
          spbu_nama: (item.spbu as Record<string, string>)?.nama || "SPBU",
          spbu_kota: (item.spbu as Record<string, string>)?.kota || "",
          jumlah_motor: item.jumlah_motor as number,
          estimasi_menit: item.estimasi_menit as number,
          traffic_status: item.traffic_status as "lancar" | "ramai" | "macet",
          created_at: item.created_at as string,
        }));
        setLaporanList(formattedData);
        // Reset ke halaman 1 jika ada data baru
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // EFFECT: Load data & subscribe realtime
  // ============================================
  useEffect(() => {
    loadLaporan();

    const channel = supabase
      .channel("laporan_log")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "laporan_antrian" },
        () => loadLaporan()
      )
      .subscribe();

    const interval = setInterval(loadLaporan, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [loadLaporan]);

  // ============================================
  // FUNGSI: Warna status
  // ============================================
  const getStatusDot = (status: string) => {
    switch (status) {
      case "lancar": return "bg-green-500";
      case "ramai": return "bg-yellow-500";
      case "macet": return "bg-red-500";
      default: return "bg-slate-400";
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          📋 Log Laporan Terbaru
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        </h3>
        <span className="text-xs text-slate-400">{laporanList.length} data</span>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="pb-2 font-medium">SPBU</th>
              <th className="pb-2 font-medium text-center">Motor</th>
              <th className="pb-2 font-medium text-center">Est. Antrian</th>
              <th className="pb-2 font-medium text-center">Status</th>
              <th className="pb-2 font-medium text-right">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            ) : laporanList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-400">
                  Belum ada laporan
                </td>
              </tr>
            ) : (
              displayedList.map((l) => (
                <tr key={l.id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-2 pr-2">
                    <div className="font-medium truncate max-w-[120px]" title={l.spbu_nama}>
                      {l.spbu_nama.replace("SPBU ", "")}
                    </div>
                    <div className="text-[10px] text-slate-400">{l.spbu_kota}</div>
                  </td>
                  <td className="py-2 text-center font-medium">{l.jumlah_motor}</td>
                  <td className="py-2 text-center">{l.estimasi_menit} meter</td>
                  <td className="py-2 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${getStatusDot(l.traffic_status)}`} 
                          title={l.traffic_status} />
                  </td>
                  <td className="py-2 text-right text-slate-400">
                    {formatDateTime(l.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginasi */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, laporanList.length)} dari {laporanList.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                ←
              </button>
              <span className="px-2 text-xs text-slate-600 dark:text-slate-300">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}