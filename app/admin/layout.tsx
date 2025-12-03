import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { LayoutDashboard, MapPin, MessageSquare, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Kalkulator BBM Aceh</p>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link
            href="/admin/spbu"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MapPin size={20} />
            Kelola SPBU
          </Link>
          <Link
            href="/admin/laporan"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MessageSquare size={20} />
            Laporan Masuk
          </Link>
        </nav>

        <div className="absolute bottom-6 px-4 w-full">
          <form action={logoutAction}>
            <button
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors text-left"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-10 p-4 flex justify-between items-center">
         <h1 className="text-lg font-bold text-blue-600">Admin Panel</h1>
         <form action={logoutAction}>
            <button className="text-red-600">
              <LogOut size={20} />
            </button>
          </form>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
