"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/src/lib/supabase";

// ============================================
// TIPE DATA
// ============================================
type InfoListrik = {
  id: string;
  kota: string;
  status: "hidup" | "padam";
  keterangan: string;
  reporter_name: string;
  created_at: string;
};

type InfoElpiji = {
  id: string;
  kota: string;
  lokasi: string;
  jenis: "3kg" | "5.5kg" | "12kg";
  status: "tersedia" | "langka" | "kosong";
  harga: number;
  reporter_name: string;
  created_at: string;
};

type InfoSPBU = {
  id: string;
  spbu_nama: string;
  spbu_kota: string;
  jenis_bbm: "pertalite" | "pertamax" | "solar" | "dexlite";
  status: "tersedia" | "menipis" | "habis";
  harga_eceran: number | null;
  keterangan: string;
  reporter_name: string;
  created_at: string;
};

type TabType = "listrik" | "elpiji" | "spbu";

// ============================================
// DAFTAR KOTA (Banda Aceh & Aceh Besar)
// ============================================
const KOTA_LIST = [
  "Banda Aceh",
  "Aceh Besar",
];

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function CrowdsourceInfo() {
  const [activeTab, setActiveTab] = useState<TabType>("listrik");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Pagination states
  const [listrikPage, setListrikPage] = useState(1);
  const [elpijiPage, setElpijiPage] = useState(1);
  const [spbuPage, setSpbuPage] = useState(1);
  const itemsPerPage = 5;
  
  // Data lists
  const [listrikList, setListrikList] = useState<InfoListrik[]>([]);
  const [elpijiList, setElpijiList] = useState<InfoElpiji[]>([]);
  const [spbuInfoList, setSpbuInfoList] = useState<InfoSPBU[]>([]);
  
  // Form states - Listrik
  const [listrikKota, setListrikKota] = useState("Banda Aceh");
  const [listrikStatus, setListrikStatus] = useState<"hidup" | "padam">("hidup");
  const [listrikKeterangan, setListrikKeterangan] = useState("");
  
  // Form states - Elpiji
  const [elpijiKota, setElpijiKota] = useState("Banda Aceh");
  const [elpijiLokasi, setElpijiLokasi] = useState("");
  const [elpijiJenis, setElpijiJenis] = useState<"3kg" | "5.5kg" | "12kg">("3kg");
  const [elpijiStatus, setElpijiStatus] = useState<"tersedia" | "langka" | "kosong">("tersedia");
  const [elpijiHarga, setElpijiHarga] = useState("");
  
  // Form states - SPBU Info
  const [spbuNama, setSpbuNama] = useState("");
  const [spbuKota, setSpbuKota] = useState("Banda Aceh");
  const [spbuJenisBBM, setSpbuJenisBBM] = useState<"pertalite" | "pertamax" | "solar" | "dexlite">("pertalite");
  const [spbuStatusBBM, setSpbuStatusBBM] = useState<"tersedia" | "menipis" | "habis">("tersedia");
  const [spbuHargaEceran, setSpbuHargaEceran] = useState("");
  const [spbuKeterangan, setSpbuKeterangan] = useState("");
  
  // Common - Default nama "Apalahu"
  const [reporterName, setReporterName] = useState("Apalahu");

  // ============================================
  // FUNGSI: Format waktu relatif
  // ============================================
  const formatTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit lalu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const days = Math.floor(diffHours / 24);
      return `${days} hari lalu`;
    } catch {
      return "Tidak diketahui";
    }
  };

  // ============================================
  // FUNGSI: Load data
  // ============================================
  const loadListrik = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("info_listrik")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setListrikList(data);
        setListrikPage(1);
      }
    } catch (error) {
      console.error("Error loading listrik:", error);
    }
  }, []);

  const loadElpiji = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("info_elpiji")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setElpijiList(data);
        setElpijiPage(1);
      }
    } catch (error) {
      console.error("Error loading elpiji:", error);
    }
  }, []);

  const loadSpbuInfo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("info_spbu")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setSpbuInfoList(data);
        setSpbuPage(1);
      }
    } catch (error) {
      console.error("Error loading SPBU info:", error);
    }
  }, []);

  // ============================================
  // EFFECT: Load data on mount
  // ============================================
  useEffect(() => {
    loadListrik();
    loadElpiji();
    loadSpbuInfo();

    // Realtime subscription
    const listrikChannel = supabase
      .channel("info_listrik_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "info_listrik" }, () => loadListrik())
      .subscribe();

    const elpijiChannel = supabase
      .channel("info_elpiji_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "info_elpiji" }, () => loadElpiji())
      .subscribe();

    const spbuChannel = supabase
      .channel("info_spbu_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "info_spbu" }, () => loadSpbuInfo())
      .subscribe();

    return () => {
      listrikChannel.unsubscribe();
      elpijiChannel.unsubscribe();
      spbuChannel.unsubscribe();
    };
  }, [loadListrik, loadElpiji, loadSpbuInfo]);

  // ============================================
  // FUNGSI: Submit form
  // ============================================
  const handleSubmitListrik = async () => {
    if (!listrikKota || !reporterName) {
      alert("Mohon lengkapi kota dan nama pelapor!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("info_listrik").insert({
        kota: listrikKota,
        status: listrikStatus,
        keterangan: listrikKeterangan,
        reporter_name: reporterName,
      });

      if (error) throw error;
      
      // Reset form
      setListrikKota("Banda Aceh");
      setListrikStatus("hidup");
      setListrikKeterangan("");
      setShowForm(false);
      alert("Terima kasih! Info listrik berhasil dilaporkan.");
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim laporan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitElpiji = async () => {
    if (!elpijiKota || !elpijiLokasi || !reporterName) {
      alert("Mohon lengkapi kota, lokasi, dan nama pelapor!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("info_elpiji").insert({
        kota: elpijiKota,
        lokasi: elpijiLokasi,
        jenis: elpijiJenis,
        status: elpijiStatus,
        harga: elpijiHarga ? parseInt(elpijiHarga) : null,
        reporter_name: reporterName,
      });

      if (error) throw error;
      
      // Reset form
      setElpijiKota("Banda Aceh");
      setElpijiLokasi("");
      setElpijiJenis("3kg");
      setElpijiStatus("tersedia");
      setElpijiHarga("");
      setShowForm(false);
      alert("Terima kasih! Info elpiji berhasil dilaporkan.");
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim laporan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSpbuInfo = async () => {
    if (!spbuNama || !spbuKota || !reporterName) {
      alert("Mohon lengkapi nama SPBU, kota, dan nama pelapor!");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("info_spbu").insert({
        spbu_nama: spbuNama,
        spbu_kota: spbuKota,
        jenis_bbm: spbuJenisBBM,
        status: spbuStatusBBM,
        harga_eceran: spbuHargaEceran ? parseInt(spbuHargaEceran) : null,
        keterangan: spbuKeterangan,
        reporter_name: reporterName,
      });

      if (error) throw error;
      
      // Reset form
      setSpbuNama("");
      setSpbuKota("Banda Aceh");
      setSpbuJenisBBM("pertalite");
      setSpbuStatusBBM("tersedia");
      setSpbuHargaEceran("");
      setSpbuKeterangan("");
      setShowForm(false);
      alert("Terima kasih! Info SPBU berhasil dilaporkan.");
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim laporan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // PAGINATION: Computed values
  // ============================================
  const listrikTotalPages = Math.ceil(listrikList.length / itemsPerPage);
  const listrikStartIndex = (listrikPage - 1) * itemsPerPage;
  const displayedListrik = listrikList.slice(listrikStartIndex, listrikStartIndex + itemsPerPage);

  const elpijiTotalPages = Math.ceil(elpijiList.length / itemsPerPage);
  const elpijiStartIndex = (elpijiPage - 1) * itemsPerPage;
  const displayedElpiji = elpijiList.slice(elpijiStartIndex, elpijiStartIndex + itemsPerPage);

  const spbuTotalPages = Math.ceil(spbuInfoList.length / itemsPerPage);
  const spbuStartIndex = (spbuPage - 1) * itemsPerPage;
  const displayedSpbu = spbuInfoList.slice(spbuStartIndex, spbuStartIndex + itemsPerPage);

  // ============================================
  // FUNGSI: Get status badge
  // ============================================
  const getListrikBadge = (status: string) => {
    switch (status) {
      case "hidup": return "bg-green-500 text-white";
      case "padam": return "bg-red-500 text-white";
      default: return "bg-slate-400 text-white";
    }
  };

  const getElpijiBadge = (status: string) => {
    switch (status) {
      case "tersedia": return "bg-green-500 text-white";
      case "langka": return "bg-yellow-500 text-white";
      case "kosong": return "bg-red-500 text-white";
      default: return "bg-slate-400 text-white";
    }
  };

  const getBBMBadge = (status: string) => {
    switch (status) {
      case "tersedia": return "bg-green-500 text-white";
      case "menipis": return "bg-yellow-500 text-white";
      case "habis": return "bg-red-500 text-white";
      default: return "bg-slate-400 text-white";
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Info Crowdsource
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Laporan dari masyarakat Aceh
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {showForm ? "Tutup" : "+ Lapor"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("listrik")}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
            activeTab === "listrik"
              ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          ⚡ Listrik
        </button>
        <button
          onClick={() => setActiveTab("elpiji")}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
            activeTab === "elpiji"
              ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          🔥 Elpiji
        </button>
        <button
          onClick={() => setActiveTab("spbu")}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
            activeTab === "spbu"
              ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          ⛽ SPBU
        </button>
      </div>

      {/* Form Input */}
      {showForm && (
        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {activeTab === "listrik" && "⚡ Laporkan Status Listrik"}
            {activeTab === "elpiji" && "🔥 Laporkan Ketersediaan Elpiji"}
            {activeTab === "spbu" && "⛽ Laporkan Info SPBU/BBM"}
          </h4>

          <div className="space-y-3">
            {/* Nama Pelapor - Common */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Nama Pelapor *
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Nama Anda (akan ditampilkan)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            {/* Form Listrik */}
            {activeTab === "listrik" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Kab/Kota *
                  </label>
                  <select
                    value={listrikKota}
                    onChange={(e) => setListrikKota(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    {KOTA_LIST.map((kota) => (
                      <option key={kota} value={kota}>{kota}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Status Listrik *
                  </label>
                  <select
                    value={listrikStatus}
                    onChange={(e) => setListrikStatus(e.target.value as typeof listrikStatus)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  >
                    <option value="hidup">🟢 Hidup / Normal</option>
                    <option value="padam">🔴 Padam Total</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Keterangan (opsional)
                  </label>
                  <input
                    type="text"
                    value={listrikKeterangan}
                    onChange={(e) => setListrikKeterangan(e.target.value)}
                    placeholder="Contoh: Padam sejak pagi, area Kuta Alam"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleSubmitListrik}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Laporan Listrik"}
                </button>
              </>
            )}

            {/* Form Elpiji */}
            {activeTab === "elpiji" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Kab/Kota *
                    </label>
                    <select
                      value={elpijiKota}
                      onChange={(e) => setElpijiKota(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    >
                      {KOTA_LIST.map((kota) => (
                        <option key={kota} value={kota}>{kota}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Jenis Tabung *
                    </label>
                    <select
                      value={elpijiJenis}
                      onChange={(e) => setElpijiJenis(e.target.value as typeof elpijiJenis)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    >
                      <option value="3kg">3 Kg (Subsidi)</option>
                      <option value="5.5kg">5.5 Kg</option>
                      <option value="12kg">12 Kg</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Lokasi/Nama Pangkalan *
                  </label>
                  <input
                    type="text"
                    value={elpijiLokasi}
                    onChange={(e) => setElpijiLokasi(e.target.value)}
                    placeholder="Contoh: Pangkalan Bu Aminah, Jl. Sudirman"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Status *
                    </label>
                    <select
                      value={elpijiStatus}
                      onChange={(e) => setElpijiStatus(e.target.value as typeof elpijiStatus)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    >
                      <option value="tersedia">🟢 Tersedia</option>
                      <option value="langka">🟡 Langka/Terbatas</option>
                      <option value="kosong">🔴 Kosong</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={elpijiHarga}
                      onChange={(e) => setElpijiHarga(e.target.value)}
                      placeholder="Contoh: 25000"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmitElpiji}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Laporan Elpiji"}
                </button>
              </>
            )}

            {/* Form SPBU Info */}
            {activeTab === "spbu" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Nama/Kode SPBU *
                    </label>
                    <input
                      type="text"
                      value={spbuNama}
                      onChange={(e) => setSpbuNama(e.target.value)}
                      placeholder="SPBU XYZ"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Kab/Kota *
                    </label>
                    <select
                      value={spbuKota}
                      onChange={(e) => setSpbuKota(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    >
                      {KOTA_LIST.map((kota) => (
                        <option key={kota} value={kota}>{kota}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Jenis BBM *
                    </label>
                    <select
                      value={spbuJenisBBM}
                      onChange={(e) => setSpbuJenisBBM(e.target.value as typeof spbuJenisBBM)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    >
                      <option value="pertalite">Pertalite</option>
                      <option value="pertamax">Pertamax</option>
                      <option value="solar">Solar</option>
                      <option value="dexlite">Dexlite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Status Stok *
                    </label>
                    <select
                      value={spbuStatusBBM}
                      onChange={(e) => setSpbuStatusBBM(e.target.value as typeof spbuStatusBBM)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    >
                      <option value="tersedia">🟢 Tersedia</option>
                      <option value="menipis">🟡 Menipis</option>
                      <option value="habis">🔴 Habis</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Keterangan / Kendala
                  </label>
                  <input
                    type="text"
                    value={spbuKeterangan}
                    onChange={(e) => setSpbuKeterangan(e.target.value)}
                    placeholder="Misal: Genset rusak, batas 10L, antrian panjang"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleSubmitSpbuInfo}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Laporan SPBU"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-2">
        {/* Listrik Tab */}
        {activeTab === "listrik" && (
          listrikList.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Belum ada laporan listrik</p>
              <p className="text-xs mt-1">Jadilah yang pertama melaporkan!</p>
            </div>
          ) : (
            <>
              {displayedListrik.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getListrikBadge(item.status)}`}>
                          {item.status === "hidup" ? "HIDUP" : "PADAM"}
                        </span>
                        <span className="text-xs text-slate-500">{item.kota}</span>
                      </div>
                      {item.keterangan && (
                        <p className="text-sm text-slate-700 dark:text-slate-300">{item.keterangan}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        👤 {item.reporter_name} • {formatTimeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Pagination Listrik */}
              {listrikTotalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400">
                    {listrikStartIndex + 1}-{Math.min(listrikStartIndex + itemsPerPage, listrikList.length)} dari {listrikList.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setListrikPage(p => Math.max(1, p - 1))}
                      disabled={listrikPage === 1}
                      className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      ←
                    </button>
                    <span className="px-2 text-xs text-slate-600 dark:text-slate-300">
                      {listrikPage}/{listrikTotalPages}
                    </span>
                    <button
                      onClick={() => setListrikPage(p => Math.min(listrikTotalPages, p + 1))}
                      disabled={listrikPage === listrikTotalPages}
                      className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}

        {/* Elpiji Tab */}
        {activeTab === "elpiji" && (
          elpijiList.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Belum ada laporan elpiji</p>
              <p className="text-xs mt-1">Jadilah yang pertama melaporkan!</p>
            </div>
          ) : (
            <>
              {displayedElpiji.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getElpijiBadge(item.status)}`}>
                          {item.status === "tersedia" ? "TERSEDIA" : item.status === "langka" ? "LANGKA" : "KOSONG"}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded">{item.jenis}</span>
                        <span className="text-xs text-slate-500">{item.kota}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.lokasi}</p>
                      {item.harga && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Rp {item.harga.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        👤 {item.reporter_name} • {formatTimeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Pagination Elpiji */}
              {elpijiTotalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400">
                    {elpijiStartIndex + 1}-{Math.min(elpijiStartIndex + itemsPerPage, elpijiList.length)} dari {elpijiList.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setElpijiPage(p => Math.max(1, p - 1))}
                      disabled={elpijiPage === 1}
                      className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      ←
                    </button>
                    <span className="px-2 text-xs text-slate-600 dark:text-slate-300">
                      {elpijiPage}/{elpijiTotalPages}
                    </span>
                    <button
                      onClick={() => setElpijiPage(p => Math.min(elpijiTotalPages, p + 1))}
                      disabled={elpijiPage === elpijiTotalPages}
                      className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}

        {/* SPBU Tab */}
        {activeTab === "spbu" && (
          spbuInfoList.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Belum ada laporan SPBU</p>
              <p className="text-xs mt-1">Jadilah yang pertama melaporkan!</p>
            </div>
          ) : (
            <>
              {displayedSpbu.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getBBMBadge(item.status)}`}>
                          {item.status === "tersedia" ? "TERSEDIA" : item.status === "menipis" ? "MENIPIS" : "HABIS"}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded uppercase">{item.jenis_bbm}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.spbu_nama}</p>
                      <p className="text-xs text-slate-500">{item.spbu_kota}</p>
                      {item.harga_eceran && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Harga eceran: Rp {item.harga_eceran.toLocaleString()}/L
                        </p>
                      )}
                      {item.keterangan && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">⚠️ {item.keterangan}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        👤 {item.reporter_name} • {formatTimeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Pagination SPBU */}
              {spbuTotalPages > 1 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400">
                    {spbuStartIndex + 1}-{Math.min(spbuStartIndex + itemsPerPage, spbuInfoList.length)} dari {spbuInfoList.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSpbuPage(p => Math.max(1, p - 1))}
                      disabled={spbuPage === 1}
                      className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      ←
                    </button>
                    <span className="px-2 text-xs text-slate-600 dark:text-slate-300">
                      {spbuPage}/{spbuTotalPages}
                    </span>
                    <button
                      onClick={() => setSpbuPage(p => Math.min(spbuTotalPages, p + 1))}
                      disabled={spbuPage === spbuTotalPages}
                      className="px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          ⚠️ Informasi dari masyarakat, mohon verifikasi ulang
        </p>
      </div>
    </div>
  );
}