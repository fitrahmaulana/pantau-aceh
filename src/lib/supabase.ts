import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qkpexjcggdxfyfezhmje.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcGV4amNnZ2R4ZnlmZXpobWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzQwMjQsImV4cCI6MjA4MDM1MDAyNH0.vbI_2JdP1gxmgX5eFam_IzGxsrMwq_pcJ3qzAVRUxp8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TIPE DATA
// ============================================
export type SPBU = {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  kota: string;
  lat: number;
  lng: number;
  buka_24_jam: boolean;
  created_at: string;
};

export type LaporanAntrian = {
  id: string;
  spbu_id: string;
  jumlah_motor: number;
  estimasi_menit: number;
  traffic_status: "lancar" | "ramai" | "macet";
  created_at: string;
};

export type SPBURealtime = SPBU & {
  antrian_motor: number;
  estimasi_menit: number;
  traffic_status: "lancar" | "ramai" | "macet" | "unknown";
  update_terakhir: string | null;
};

// ============================================
// FUNGSI: Ambil semua SPBU dengan data realtime
// ============================================
export async function getSPBUList(): Promise<SPBURealtime[]> {
  const { data, error } = await supabase
    .from("spbu_realtime")
    .select("*")
    .order("kota", { ascending: true });

  if (error) {
    console.error("Error fetching SPBU:", error);
    return [];
  }

  return data || [];
}

// ============================================
// FUNGSI: Kirim laporan antrian baru
// ============================================
export async function kirimLaporanAntrian(
  spbuId: string,
  jumlahMotor: number,
  estimasiMenit: number
): Promise<boolean> {
  // Tentukan traffic status berdasarkan estimasi
  let trafficStatus: "lancar" | "ramai" | "macet" = "lancar";
  if (estimasiMenit > 90) {
    trafficStatus = "macet";
  } else if (estimasiMenit > 30) {
    trafficStatus = "ramai";
  }

  const { error } = await supabase.from("laporan_antrian").insert({
    spbu_id: spbuId,
    jumlah_motor: jumlahMotor,
    estimasi_menit: estimasiMenit,
    traffic_status: trafficStatus,
  });

  if (error) {
    console.error("Error submitting report:", error);
    return false;
  }

  return true;
}

// ============================================
// FUNGSI: Subscribe ke update realtime
// ============================================
export function subscribeToUpdates(callback: () => void) {
  const channel = supabase
    .channel("laporan_changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "laporan_antrian",
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
