import { supabaseAdmin } from "@/src/lib/supabase-admin";
import LaporanClient from "./page.client";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const { data: laporanList } = await supabaseAdmin
    .from("laporan_antrian")
    .select(`
      *,
      spbu (
        nama,
        kota
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100); // Limit to last 100 reports for performance

  // Transform data to match type if necessary, though Supabase join returns object structure
  // We cast to any to avoid complex type matching with the join for this simple admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <LaporanClient initialData={laporanList as any || []} />;
}
