import { supabaseAdmin } from "@/src/lib/supabase-admin";
import { MapPin, MessageSquare, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch stats concurrently
  const [spbuData, laporanData] = await Promise.all([
    supabaseAdmin.from("spbu").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("laporan_antrian").select("id", { count: "exact", head: true }),
  ]);

  const totalSPBU = spbuData.count || 0;
  const totalLaporan = laporanData.count || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Ringkasan data aplikasi Kalkulator BBM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-blue-600">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total SPBU</p>
            <p className="text-2xl font-bold text-gray-900">{totalSPBU}</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 rounded-lg text-purple-600">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Laporan</p>
            <p className="text-2xl font-bold text-gray-900">{totalLaporan}</p>
          </div>
        </div>

        {/* Stat Card 3 - Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 rounded-lg text-orange-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status Sistem</p>
            <p className="text-lg font-bold text-green-600">Active</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Panduan Admin</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Gunakan menu <strong>Kelola SPBU</strong> untuk menambah, mengedit, atau menghapus data SPBU.</li>
          <li>Gunakan menu <strong>Laporan Masuk</strong> untuk memantau kontribusi user dan menghapus laporan spam.</li>
          <li>Pastikan untuk logout setelah selesai menggunakan panel admin.</li>
        </ul>
      </div>
    </div>
  );
}
