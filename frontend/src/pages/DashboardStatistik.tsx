import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/report";
import { getProducts } from "../services/product";
import {
  TrendUp,
  Receipt,
  WarningCircle,
  Package,
  Storefront,
  ArrowRight,
} from "phosphor-react";
import { Link } from "react-router-dom";

export default function DashboardStatistik() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil data laporan HARI INI
        const reportData = await getDashboardStats("today");
        setSummary(reportData.summary);
        // Ambil 5 transaksi paling baru saja
        setRecentTransactions(reportData.transactions.slice(0, 5));

        // 2. Ambil data semua produk untuk cari yang stoknya tipis (< 10)
        const products = await getProducts();
        const lowStock = products.filter(
          (p: any) => p.stock > 0 && p.stock <= 10,
        );
        setLowStockProducts(lowStock);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-zinc-400 font-bold animate-pulse">
          Menyiapkan Pusat Komando...
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans pb-10 animate-fade-in">
      {/* HEADER WELCOME */}
      <header className="mb-8 bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 rounded-3xl text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <Storefront
          size={160}
          weight="duotone"
          className="absolute -right-10 -bottom-10 text-white/5"
        />
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Selamat datang, {user?.name || "Komandan"}! 👋
          </h1>
          <p className="text-zinc-400 font-medium">
            Berikut adalah ringkasan performa Kopi Kita hari ini.
          </p>
        </div>
      </header>

      {/* KARTU STATISTIK (KPI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Omzet Hari Ini */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 flex items-center gap-5 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
            <TrendUp size={32} weight="bold" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Omzet Hari Ini
            </p>
            <h3 className="text-2xl font-black text-zinc-800">
              Rp {summary.revenue?.toLocaleString("id-ID") || 0}
            </h3>
          </div>
        </div>

        {/* Transaksi Hari Ini */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt size={32} weight="bold" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Transaksi Hari Ini
            </p>
            <h3 className="text-2xl font-black text-zinc-800">
              {summary.transactions_count || 0} Struk
            </h3>
          </div>
        </div>

        {/* Alert Stok Kritis */}
        <div
          className={`${lowStockProducts.length > 0 ? "bg-red-50 border-red-200" : "bg-white border-zinc-200"} p-6 rounded-3xl shadow-sm border flex items-center gap-5 transition-colors`}
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${lowStockProducts.length > 0 ? "bg-red-100 text-red-600" : "bg-orange-50 text-orange-500"}`}
          >
            {lowStockProducts.length > 0 ? (
              <WarningCircle
                size={32}
                weight="fill"
                className="animate-pulse"
              />
            ) : (
              <Package size={32} weight="bold" />
            )}
          </div>
          <div>
            <p
              className={`text-sm font-bold uppercase tracking-wider mb-1 ${lowStockProducts.length > 0 ? "text-red-500" : "text-zinc-400"}`}
            >
              Peringatan Stok
            </p>
            <h3
              className={`text-2xl font-black ${lowStockProducts.length > 0 ? "text-red-700" : "text-zinc-800"}`}
            >
              {lowStockProducts.length > 0
                ? `${lowStockProducts.length} Item Kritis`
                : "Stok Aman"}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TABEL TRANSAKSI TERBARU */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-zinc-800 flex items-center gap-2">
              <Receipt size={24} className="text-blue-500" /> Transaksi Terakhir
            </h2>
            <Link
              to="/laporan"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
          <div className="p-2">
            {recentTransactions.length === 0 ? (
              <p className="text-center py-10 text-zinc-400 font-bold">
                Belum ada transaksi hari ini.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-zinc-50">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50">
                      <td className="p-4 font-bold text-zinc-800">
                        #{tx.invoice || `INV-${String(tx.id).padStart(4, "0")}`}
                      </td>
                      <td className="p-4 text-zinc-500 font-medium text-center">
                        {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 font-black text-orange-600 text-right">
                        Rp {Number(tx.total_price).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* TABEL STOK MENIPIS */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-zinc-800 flex items-center gap-2">
              <WarningCircle size={24} className="text-red-500" /> Stok Menipis
              (&le; 10)
            </h2>
            <Link
              to="/kelola-menu"
              className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Update Stok <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
          <div className="p-2">
            {lowStockProducts.length === 0 ? (
              <p className="text-center py-10 text-zinc-400 font-bold">
                Semua stok produk masih aman sentosa! 🎉
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-zinc-50">
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-red-50/50">
                      <td className="p-4 font-bold text-zinc-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package
                              size={16}
                              className="m-auto mt-2 text-zinc-400"
                            />
                          )}
                        </div>
                        {product.name}
                      </td>
                      <td className="p-4 font-medium text-zinc-500 text-center">
                        {product.category?.name}
                      </td>
                      <td className="p-4 text-right">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md font-black text-xs">
                          Sisa {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
