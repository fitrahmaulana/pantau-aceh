"use client";

import { useState } from "react";
import { deleteSPBU } from "@/app/actions/spbu";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import SPBUForm from "./SPBUForm";
import type { SPBU } from "@/src/lib/supabase";

export default function SPBUClient({ initialData }: { initialData: SPBU[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<SPBU | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = initialData.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kota.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleCreate() {
    setEditingData(null);
    setIsFormOpen(true);
  }

  function handleEdit(data: SPBU) {
    setEditingData(data);
    setIsFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus SPBU ini?")) {
      await deleteSPBU(id);
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola SPBU</h1>
          <p className="text-gray-500">Daftar semua SPBU yang terdaftar.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Tambah SPBU
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama, kode, atau kota..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Kode</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Nama SPBU</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Kota</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-600">{item.kode}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.nama}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.alamat}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.kota}</td>
                    <td className="px-6 py-4">
                      {item.buka_24_jam ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          24 Jam
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Reguler
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SPBUForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingData}
      />
    </div>
  );
}
