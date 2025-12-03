import FuelCalculator from "@/src/components/FuelCalculator";
import SPBURecommendation from "@/src/components/SPBURecommendation";
import LaporanAntrian from "@/src/components/LaporanAntrian";
import CrowdsourceInfo from "@/src/components/CrowdsourceInfo";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            � Pantau Aceh
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Info BBM, Listrik & Elpiji dari masyarakat untuk masyarakat Aceh
          </p>
        </div>

        {/* Layout 2 Kolom */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Kalkulator - Kiri */}
          <div className="w-full lg:w-1/2 space-y-6">
            <FuelCalculator />
            {/* Info Crowdsource dari masyarakat */}
            <CrowdsourceInfo />
          </div>

          {/* Rekomendasi SPBU & Crowdsource - Kanan */}
          <div className="w-full lg:w-1/2 space-y-6">
            <SPBURecommendation />
            {/* Log Laporan di bawah Kalkulator */}
            <LaporanAntrian />
          </div>
        </div>
      </div>
    </main>
  );
}
