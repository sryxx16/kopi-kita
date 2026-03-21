import { useState, useEffect } from "react";
import { getDashboardStats } from "../services/report";

export default function ReportPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        setRecentTransactions(data.recent_transactions);
      } catch (error) {
        console.error("Gagal mengambil data laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-orange-600 font-bold">
        Memuat Laporan Keuangan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-sans">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900">
            Dashboard Admin
          </h1>
          <p className="text-zinc-500 mt-1">Rekapitulasi Penjualan Kopi Kita</p>
        </div>
      </header>

      {/* STATS CARDS (Kotak Cuan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 border-l-4 border-l-orange-500">
          <h3 className="text-zinc-500 font-medium mb-1">
            Pendapatan Hari Ini
          </h3>
          <p className="text-3xl font-extrabold text-gray-800">
            {formatRupiah(stats?.income_today || 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
          <h3 className="text-zinc-500 font-medium mb-1">Transaksi Hari Ini</h3>
          <p className="text-3xl font-extrabold text-gray-800">
            {stats?.transactions_today || 0}{" "}
            <span className="text-sm font-normal text-gray-400">Order</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
          <h3 className="text-zinc-500 font-medium mb-1">
            Total Pendapatan (All Time)
          </h3>
          <p className="text-3xl font-extrabold text-gray-800">
            {formatRupiah(stats?.total_income || 0)}
          </p>
        </div>
      </div>

      {/* TABEL RIWAYAT TRANSAKSI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            10 Transaksi Terakhir
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-sm border-b">
                <th className="p-4 font-semibold">Nomor Invoice</th>
                <th className="p-4 font-semibold">Waktu</th>
                <th className="p-4 font-semibold">Kasir</th>
                <th className="p-4 font-semibold">Total Belanja</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-400">
                    Belum ada transaksi hari ini.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((trx, index) => (
                  <tr
                    key={trx.id}
                    className={`border-b border-gray-50 hover:bg-orange-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-zinc-50/30"}`}
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {trx.invoice_number}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(trx.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-4 text-gray-600">
                      {trx.user?.name || "Sistem"}
                    </td>
                    <td className="p-4 font-bold text-gray-800">
                      {formatRupiah(trx.total_price)}
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        Lunas
                      </span>
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
