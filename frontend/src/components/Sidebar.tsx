import { Link, useLocation } from "react-router-dom";
import {
  Layout,
  Coffee,
  Users,
  ChartLineUp,
  SignOut,
  Storefront,
  Package,
  Ticket,
  Gear,
  ShoppingCart,
} from "phosphor-react";

export default function Sidebar() {
  const location = useLocation();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user?.role || "kasir";

  const allMenus = [
    {
      path: "/kasir",
      name: "Area Kasir",
      icon: <ShoppingCart size={20} />,
      roles: ["admin", "kasir"],
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <Layout size={20} />,
      roles: ["admin"],
    },
    {
      path: "/kelola-menu",
      name: "Kelola Menu",
      icon: <Coffee size={20} />,
      roles: ["admin"],
    },
    {
      path: "/inventaris",
      name: "Inventaris",
      icon: <Package size={20} />,
      roles: ["admin"],
    },
    {
      path: "/promo",
      name: "Manajemen Promo",
      icon: <Ticket size={20} />,
      roles: ["admin"],
    },
    {
      path: "/laporan",
      name: "Laporan Keuangan",
      icon: <ChartLineUp size={20} />,
      roles: ["admin"],
    },
    {
      path: "/karyawan",
      name: "Data Karyawan",
      icon: <Users size={20} />,
      roles: ["admin"],
    },
    {
      path: "/pengaturan",
      name: "Pengaturan Toko",
      icon: <Gear size={20} />,
      roles: ["admin"],
    },
  ];

  const allowedMenus = allMenus.filter((menu) => menu.roles.includes(userRole));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    // Tambahan print:hidden ada di class <aside> ini biar hilang pas nge-print
    <aside className="w-64 bg-zinc-900 h-screen fixed top-0 left-0 flex flex-col text-zinc-400 z-50 shadow-2xl print:hidden">
      <div className="p-6 flex items-center gap-3 text-white border-b border-zinc-800">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
          <Storefront size={20} weight="bold" />
        </div>
        <div>
          <h2 className="font-black text-xl tracking-tighter uppercase leading-none">
            Kopi Kita
          </h2>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest mt-1 inline-block ${userRole === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}
          >
            {userRole}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {allowedMenus.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              location.pathname === item.path
                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                : "hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="mb-4 px-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-white text-xs">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-zinc-500 truncate">
              {user?.email || "email@kopi.com"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <SignOut size={20} weight="bold" />
          Keluar Sesi
        </button>
      </div>
    </aside>
  );
}
