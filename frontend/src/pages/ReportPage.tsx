import { useEffect, useState } from "react";
import { getDashboardStats, exportDashboardExcel } from "../services/report";
import { voidTransaction } from "../services/transaction";
import {
  ChartBar,
  Receipt,
  TrendUp,
  TrendDown,
  CalendarBlank,
  X,
  Printer,
  Coffee,
  FloppyDisk,
  Trash,
} from "phosphor-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ReportPage() {
  // State untuk filter dan loading
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");

  // State untuk data dari API (Ditambah any agar TS tidak error saat baca revenue_change)
  const [summary, setSummary] = useState<any>({
    revenue: 0,
    transactions_count: 0,
    revenue_change: 0,
    transactions_count_change: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // State untuk modal struk digital
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Fungsi untuk mengambil data laporan
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats(
        filter,
        filter === "custom" ? customDate : undefined,
      );
      setSummary(data.summary);
      setTransactions(data.transactions);
      setHourlyData(data.hourly_analysis || []);
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk void transaksi
  const handleVoid = async (id: number, invoice: string) => {
    const isConfirm = window.confirm(
      `🚨 PERINGATAN VOID TRANSAKSI 🚨\n\nApakah Anda yakin ingin membatalkan transaksi #${invoice}?\nSemua stok produk pada struk ini akan dikembalikan secara otomatis.`,
    );

    if (isConfirm) {
      try {
        await voidTransaction(id);
        alert(
          `Transaksi #${invoice} berhasil di-void! Stok telah dikembalikan.`,
        );
        fetchReports(); // Refresh data setelah dihapus
      } catch (error) {
        alert("Gagal melakukan Void transaksi.");
      }
    }
  };

  // Fungsi canggih untuk download file Excel tanpa buka tab baru
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // 1. Download file-nya ke memori browser (sebagai Blob)
      const blobData = await exportDashboardExcel(
        filter,
        filter === "custom" ? customDate : undefined,
      );

      // 2. Bikin URL lokal dari blob tersebut
      const url = window.URL.createObjectURL(new Blob([blobData]));

      // 3. Bikin elemen link <a> gaib untuk memicu download otomatis
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Laporan_Kopi_Kita_${filter}.xlsx`); // Nama file otomatis
      document.body.appendChild(link);
      link.click(); // Klik linknya secara otomatis

      // 4. Bersihkan sisa-sisa elemen gaibnya
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal export:", error);
      alert("Gagal mengunduh file Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // Fungsi untuk mendapatkan data produk terlaris
  const getTopProducts = () => {
    const productSales: Record<string, number> = {};
    transactions.forEach((tx) => {
      tx.details?.forEach((detail: any) => {
        const name = detail.product?.name || "Produk Dihapus";
        productSales[name] = (productSales[name] || 0) + detail.quantity;
      });
    });

    return Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Effect untuk refresh data saat filter berubah
  useEffect(() => {
    if (filter === "custom" && !customDate) return;
    fetchReports();
  }, [filter, customDate]);

  // Data untuk grafik
  const pieData = getTopProducts();
  const COLORS = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#ffedd5"];
  const bestSeller = pieData.length > 0 ? pieData[0].name : "-";

  return (
    <div className="font-sans pb-10">
      {/* HEADER & FILTER */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-zinc-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Laporan Penjualan
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Pantau performa pendapatan kedai Anda
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Tombol Export Excel */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm ${
              isExporting
                ? "bg-zinc-400 text-zinc-100 cursor-wait"
                : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"
            }`}
          >
            <FloppyDisk size={20} weight="bold" />
            {isExporting ? "Menyiapkan..." : "Ekspor Excel"}
          </button>

          {/* Filter Periode */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <CalendarBlank size={20} weight="bold" />
            </div>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                if (e.target.value !== "custom") setCustomDate("");
              }}
              className="bg-transparent font-bold text-zinc-700 outline-none cursor-pointer pr-4 text-sm"
            >
              <option value="today">Hari Ini</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
              <option value="custom">Pilih Tanggal...</option>
            </select>
          </div>

          {/* Input Tanggal Custom */}
          {filter === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm font-bold text-zinc-700 text-sm outline-none focus:ring-2 focus:ring-orange-500 animate-fade-in"
            />
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <p className="text-zinc-400 font-bold animate-pulse">
            Menyiapkan Laporan...
          </p>
        </div>
      ) : (
        <>
          {/* KARTU STATISTIK (KPI CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card Pendapatan */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex items-center gap-5 hover:shadow-md transition-all relative">
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <TrendUp size={32} weight="bold" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Total Pendapatan
                </p>
                <h3 className="text-2xl font-black text-zinc-800">
                  Rp {summary.revenue?.toLocaleString("id-ID") || 0}
                </h3>
              </div>
              {/* Indikator Perbandingan */}
              <div
                className={`absolute top-6 right-6 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${summary.revenue_change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {summary.revenue_change >= 0 ? (
                  <TrendUp weight="bold" />
                ) : (
                  <TrendDown weight="bold" />
                )}
                {Math.abs(summary.revenue_change || 0)}%
              </div>
            </div>

            {/* Card Transaksi */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex items-center gap-5 hover:shadow-md transition-all relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt size={32} weight="bold" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Total Transaksi
                </p>
                <h3 className="text-2xl font-black text-zinc-800">
                  {summary.transactions_count || 0} Struk
                </h3>
              </div>
              {/* Indikator Perbandingan */}
              <div
                className={`absolute top-6 right-6 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${summary.transactions_count_change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {summary.transactions_count_change >= 0 ? (
                  <TrendUp weight="bold" />
                ) : (
                  <TrendDown weight="bold" />
                )}
                {Math.abs(summary.transactions_count_change || 0)}%
              </div>
            </div>

            {/* Card Menu Terlaris */}
            <div className="bg-orange-600 p-6 rounded-3xl shadow-lg shadow-orange-600/20 text-white flex items-center gap-5 relative overflow-hidden">
              <ChartBar
                size={120}
                weight="duotone"
                className="absolute -right-6 -bottom-6 opacity-20"
              />
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center z-10 backdrop-blur-sm">
                <Coffee size={32} weight="fill" />
              </div>
              <div className="z-10">
                <p className="text-sm font-bold text-orange-200 uppercase tracking-wider mb-1">
                  Menu Paling Laris
                </p>
                <h3 className="text-2xl font-black truncate max-w-[180px]">
                  {bestSeller}
                </h3>
              </div>
            </div>
          </div>

          {/* BARIS 2: TABEL & PIE CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                <h2 className="text-lg font-black text-zinc-800 flex items-center gap-2">
                  <Receipt size={24} className="text-zinc-400" /> Riwayat
                  Transaksi
                </h2>
              </div>
              <div className="overflow-x-auto flex-1 p-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                      <th className="p-3 font-bold">Waktu</th>
                      <th className="p-3 font-bold">No. Invoice</th>
                      <th className="p-3 font-bold text-right">Total Bayar</th>
                      <th className="p-3 font-bold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-zinc-400 font-bold"
                        >
                          Belum ada transaksi di periode ini
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-zinc-50 transition-colors"
                        >
                          <td className="p-3 text-zinc-500 font-medium">
                            {new Date(tx.created_at).toLocaleString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="p-3 font-bold text-zinc-800">
                            #
                            {tx.invoice && String(tx.invoice) !== "NaN"
                              ? tx.invoice
                              : `INV-${String(tx.id).padStart(4, "0")}`}
                          </td>
                          <td className="p-3 font-black text-orange-600 text-right">
                            Rp {Number(tx.total_price).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setSelectedInvoice(tx)}
                                className="text-xs font-bold bg-zinc-100 text-zinc-600 hover:bg-zinc-900 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Lihat
                              </button>
                              {/* 🔥 TOMBOL VOID */}
                              <button
                                onClick={() =>
                                  handleVoid(
                                    tx.id,
                                    tx.invoice ||
                                      `INV-${String(tx.id).padStart(4, "0")}`,
                                  )
                                }
                                title="Void Transaksi"
                                className="text-xs font-bold bg-red-50 text-red-500 hover:bg-red-600 hover:text-white p-1.5 rounded-lg transition-colors flex items-center"
                              >
                                <Trash size={16} weight="bold" />
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

            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 flex flex-col items-center">
              <h2 className="text-lg font-black text-zinc-800 w-full mb-6 flex items-center gap-2">
                <ChartBar size={24} className="text-orange-500" /> Porsi
                Penjualan
              </h2>
              {pieData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-zinc-400 font-bold">
                  Data tidak tersedia
                </div>
              ) : (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} Porsi`, "Terjual"]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* BARIS 3: GRAFIK JAM TERAMAI */}
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 mt-8">
            <h2 className="text-lg font-black text-zinc-800 mb-6 flex items-center gap-2">
              <ChartBar size={24} className="text-blue-500" /> Analisis Jam
              Teramai
            </h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f4f4f5"
                  />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                    tick={{ fontSize: 12, fontWeight: "bold" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value) => [`${value} Transaksi`, "Jumlah"]}
                    labelFormatter={(hour) => `Jam ${hour}:00`}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-zinc-400 mt-4 font-medium italic">
              * Data menunjukkan frekuensi transaksi pelanggan berdasarkan waktu
            </p>
          </div>
        </>
      )}

      {/* MODAL STRUK DIGITAL */}
      {selectedInvoice &&
        (() => {
          // Hitung data untuk struk
          const totalBelanja = Number(selectedInvoice.total_price) || 0;
          const tunai =
            Number(selectedInvoice.pay_amount || selectedInvoice.amount_paid) ||
            totalBelanja;
          const kembalian = tunai > totalBelanja ? tunai - totalBelanja : 0;
          const noInvoice =
            selectedInvoice.invoice && String(selectedInvoice.invoice) !== "NaN"
              ? selectedInvoice.invoice
              : `INV-${String(selectedInvoice.id).padStart(4, "0")}`;

          return (
            <div className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col font-mono text-sm relative">
                {/* Tombol Tutup */}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 bg-zinc-100 rounded-full p-1"
                >
                  <X size={20} weight="bold" />
                </button>

                {/* Header Struk */}
                <div className="p-8 pb-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">
                      KOPI KITA
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1">
                      Jl. Ngoding Bersama No. 99
                    </p>
                  </div>

                  {/* Info Transaksi */}
                  <div className="flex justify-between text-xs text-zinc-600 mb-2 border-b border-dashed border-zinc-300 pb-2">
                    <div>
                      <p>
                        Tgl:{" "}
                        {new Date(
                          selectedInvoice.created_at,
                        ).toLocaleDateString("id-ID")}
                      </p>
                      <p>
                        Jam:{" "}
                        {new Date(
                          selectedInvoice.created_at,
                        ).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>Inv: #{noInvoice}</p>
                      <p>Kasir: Sistem</p>
                    </div>
                  </div>

                  {/* Daftar Item */}
                  <div className="my-4 space-y-3">
                    {selectedInvoice.details?.map((item: any, idx: number) => {
                      const hargaItem = Number(
                        item.price || item.product?.price || 0,
                      );
                      return (
                        <div
                          key={idx}
                          className="flex justify-between items-start"
                        >
                          <div className="flex-1 pr-4">
                            <p className="font-bold text-zinc-800">
                              {item.product?.name || "Item Dihapus"}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {item.quantity} x Rp{" "}
                              {hargaItem.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <p className="font-bold text-zinc-800">
                            Rp{" "}
                            {(item.quantity * hargaItem).toLocaleString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total dan Pembayaran */}
                  <div className="border-t border-dashed border-zinc-300 pt-3 space-y-1">
                    <div className="flex justify-between text-zinc-600 font-bold">
                      <p>Total Belanja</p>
                      <p>Rp {totalBelanja.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <p>Tunai</p>
                      <p>Rp {tunai.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex justify-between text-zinc-800 font-black text-base mt-2 pt-2 border-t border-zinc-200">
                      <p>KEMBALIAN</p>
                      <p>Rp {kembalian.toLocaleString("id-ID")}</p>
                    </div>
                  </div>

                  {/* Footer Struk */}
                  <div className="text-center mt-8 text-xs text-zinc-500 font-bold">
                    <p>Terima Kasih</p>
                    <p>Selamat Menikmati Kopi Kami!</p>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="bg-zinc-50 border-t border-zinc-200 p-4 flex justify-center gap-4 font-sans">
                  <button className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                    <Printer size={18} weight="bold" /> Cetak Struk
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
