import { supabaseAdmin } from "@/src/lib/supabase-admin";
import SPBUClient from "./page.client";

export const dynamic = "force-dynamic";

export default async function SPBUPage() {
  const { data: spbuList } = await supabaseAdmin
    .from("spbu")
    .select("*")
    .order("created_at", { ascending: false });

  return <SPBUClient initialData={spbuList || []} />;
}
