"use client";

import { useState } from "react";
import { deleteLaporan } from "@/app/actions/laporan";
import { Trash2, Search, Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Laporan = {
  id: string;
  spbu_id: string;
  jumlah_motor: number;
  estimasi_menit: number;
  traffic_status: string;
  created_at: string;
  spbu?: {
    nama: string;
    kota: string;
  };
};

export default function LaporanClient({ initialData }: { initialData: Laporan[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Optimistic UI state could be added here, but for simplicity we rely on revalidation

  const filteredData = initialData.filter((item) =>
    (item.spbu?.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.spbu?.kota || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (confirm("Hapus laporan ini? Tindakan ini tidak dapat dibatalkan.")) {
      await deleteLaporan(id);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "lancar":
        return "bg-green-100 text-green-800";
      case "ramai":
        return "bg-yellow-100 text-yellow-800";
      case "macet":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Masuk</h1>
        <p className="text-gray-500">Pantau dan moderasi laporan dari pengguna.</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama SPBU atau kota..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Waktu</th>
                <th className="px-6 py-4 font-semibold text-gray-700">SPBU</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Laporan</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={32} className="text-gray-300" />
                      <p>Belum ada laporan masuk.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>{format(new Date(item.created_at), "dd MMM yyyy", { locale: idLocale })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <Clock size={14} />
                        <span>{format(new Date(item.created_at), "HH:mm", { locale: idLocale })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.spbu?.nama || "Unknown SPBU"}</div>
                      <div className="text-xs text-gray-500">{item.spbu?.kota}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{item.jumlah_motor} Motor</div>
                      <div className="text-xs text-gray-500">Est. {item.estimasi_menit} menit</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(item.traffic_status)}`}>
                        {item.traffic_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Laporan Spam"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
