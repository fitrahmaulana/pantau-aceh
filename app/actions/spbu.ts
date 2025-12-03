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

export async function createSPBU(formData: FormData) {
  try {
    await checkAuth();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const kode = formData.get("kode") as string;
  const nama = formData.get("nama") as string;
  const alamat = formData.get("alamat") as string;
  const kota = formData.get("kota") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);
  const buka_24_jam = formData.get("buka_24_jam") === "on";

  const { error } = await supabaseAdmin.from("spbu").insert({
    kode,
    nama,
    alamat,
    kota,
    lat,
    lng,
    buka_24_jam,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/spbu");
  return { success: true };
}

export async function updateSPBU(formData: FormData) {
  try {
    await checkAuth();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const kode = formData.get("kode") as string;
  const nama = formData.get("nama") as string;
  const alamat = formData.get("alamat") as string;
  const kota = formData.get("kota") as string;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);
  const buka_24_jam = formData.get("buka_24_jam") === "on";

  const { error } = await supabaseAdmin
    .from("spbu")
    .update({
      kode,
      nama,
      alamat,
      kota,
      lat,
      lng,
      buka_24_jam,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/spbu");
  return { success: true };
}

export async function deleteSPBU(id: string) {
  try {
    await checkAuth();
  } catch (error) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabaseAdmin.from("spbu").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/spbu");
  return { success: true };
}
