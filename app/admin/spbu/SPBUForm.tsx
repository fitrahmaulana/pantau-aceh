"use client";

import { useState } from "react";
import { createSPBU, updateSPBU } from "@/app/actions/spbu";
import { X } from "lucide-react";

type SPBU = {
  id?: string;
  kode: string;
  nama: string;
  alamat: string;
  kota: string;
  lat: number;
  lng: number;
  buka_24_jam: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SPBU | null;
};

export default function SPBUForm({ isOpen, onClose, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // If editing, append ID
    if (initialData?.id) {
        formData.append("id", initialData.id);
    }

    const action = initialData ? updateSPBU : createSPBU;
    const result = await action(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit SPBU" : "Tambah SPBU Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode SPBU
              </label>
              <input
                type="text"
                name="kode"
                defaultValue={initialData?.kode}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="14.201.xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kota/Kab
              </label>
              <select
                name="kota"
                defaultValue={initialData?.kota || "Banda Aceh"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Banda Aceh">Banda Aceh</option>
                <option value="Aceh Besar">Aceh Besar</option>
                <option value="Pidie">Pidie</option>
                <option value="Lhokseumawe">Lhokseumawe</option>
                <option value="Langsa">Langsa</option>
                <option value="Meulaboh">Meulaboh</option>
                {/* Add more as needed */}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama SPBU
            </label>
            <input
              type="text"
              name="nama"
              defaultValue={initialData?.nama}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="SPBU Simpang..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              name="alamat"
              defaultValue={initialData?.alamat}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Jl. Teuku Umar No..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="lat"
                defaultValue={initialData?.lat}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="5.5..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="lng"
                defaultValue={initialData?.lng}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="95.3..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="buka_24_jam"
              id="buka_24_jam"
              defaultChecked={initialData?.buka_24_jam}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="buka_24_jam" className="text-sm text-gray-700">
              Buka 24 Jam
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
