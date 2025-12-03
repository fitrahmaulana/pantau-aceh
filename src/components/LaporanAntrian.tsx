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

  // ============================================
  // FUNGSI: Format waktu (tanggal dan jam)
  // ============================================
  const formatDateTime = (dateString: string): string => {
    const utcDateString = dateString.endsWith("Z") ? dateString : dateString + "Z";
    const date = new Date(utcDateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
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
              laporanList.map((l) => (
                <tr key={l.id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-2 pr-2">
                    <div className="font-medium truncate max-w-[120px]" title={l.spbu_nama}>
                      {l.spbu_nama.replace("SPBU ", "")}
                    </div>
                    <div className="text-[10px] text-slate-400">{l.spbu_kota}</div>
                  </td>
                  <td className="py-2 text-center font-medium">{l.jumlah_motor}</td>
                  <td className="py-2 text-center">{l.estimasi_menit}m</td>
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
      </div>
    </div>
  );
}