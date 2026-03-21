import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Coffee,
  Monitor,
  ShoppingCart,
  ChartBar,
  SignOut,
  Users,
} from "phosphor-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. MENGAMBIL DATA USER DARI STORAGE
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || "kasir"; // Default ke kasir kalau kosong
  const userName = user?.name || "User";

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-64 bg-zinc-900 text-zinc-300 flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-50">
      {/* Logo & Info User */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <Coffee size={24} weight="bold" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white leading-tight">
              Kopi Kita
            </h1>
          </div>
        </div>
        {/* Badge Role */}
        <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
          <p className="text-xs text-zinc-400 mb-1">Login sebagai:</p>
          <p className="font-bold text-white truncate">{userName}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider ${role === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* 🔴 MENU KHUSUS ADMIN 🔴 */}
        {role === "admin" && (
          <>
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-4 mb-2">
              Menu Admin
            </p>

            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive("/dashboard") ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "hover:bg-zinc-800 hover:text-white"}`}
            >
              <Monitor
                size={22}
                weight={isActive("/dashboard") ? "fill" : "regular"}
              />
              <span className="font-semibold">Kelola Menu</span>
            </Link>

            <Link
              to="/laporan"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive("/laporan") ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "hover:bg-zinc-800 hover:text-white"}`}
            >
              <ChartBar
                size={22}
                weight={isActive("/laporan") ? "fill" : "regular"}
              />
              <span className="font-semibold">Laporan Keuangan</span>
            </Link>

            <Link
              to="/karyawan"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive("/karyawan") ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "hover:bg-zinc-800 hover:text-white"}`}
            >
              <Users
                size={22}
                weight={isActive("/karyawan") ? "fill" : "regular"}
              />
              <span className="font-semibold">Data Karyawan</span>
            </Link>
          </>
        )}

        {/* 🟢 MENU UNTUK KASIR & ADMIN 🟢 */}
        <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-6 mb-2">
          Menu Kasir
        </p>

        <Link
          to="/kasir"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive("/kasir") ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "hover:bg-zinc-800 hover:text-white"}`}
        >
          <ShoppingCart
            size={22}
            weight={isActive("/kasir") ? "fill" : "regular"}
          />
          <span className="font-semibold">Mesin Kasir (POS)</span>
        </Link>
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 font-bold"
        >
          <SignOut size={22} weight="bold" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </div>
  );
}
