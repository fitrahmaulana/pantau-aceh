"use server";

import { supabaseAdmin } from "@/src/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function checkAuth() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");
  if (!adminSession || adminSession.value !== "true") {
    throw new Error("Unauthorized");
  }
}

export async function deleteLaporan(id: string) {
  try {
    await checkAuth();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabaseAdmin.from("laporan_antrian").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/laporan");
  return { success: true };
}
