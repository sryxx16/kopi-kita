import { useEffect, useState, useMemo } from "react";
import { getDashboardStats, exportDashboardExcel } from "../services/report";
import { voidTransaction } from "../services/transaction";
import { getExpenses, createExpense, deleteExpense } from "../services/expense";
import {
  ChartLineUp,
  Receipt,
  TrendUp,
  TrendDown,
  CalendarBlank,
  X,
  Printer,
  FloppyDisk,
  Trash,
  MagnifyingGlass,
  Money,
  Wallet,
  ChartPieSlice,
  Coins,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  LockKey,
  QrCode,
  Bank,
} from "phosphor-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("7days");
  const [customDate, setCustomDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");

  const [summary, setSummary] = useState<any>({
    revenue: 0,
    gross_profit: 0,
    total_expense: 0,
    net_profit: 0,
    transactions_count: 0,
    revenue_change: 0,
    transactions_count_change: 0,
    total_discount: 0,
    payment_breakdown: { cash: 0, qris: 0, transfer: 0 },
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    expense_date: new Date().toISOString().split("T")[0],
    category: "Operasional",
    description: "",
    amount: "",
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats(
        filter,
        filter === "custom" ? customDate : undefined,
      );

      if (data && data.summary) {
        setSummary(data.summary);
      }

      if (data && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else if (
        data &&
        data.transactions &&
        Array.isArray(data.transactions.data)
      ) {
        setTransactions(data.transactions.data);
      } else {
        setTransactions([]);
      }

      const expenseData = await getExpenses();
      if (Array.isArray(expenseData)) {
        setExpensesList(expenseData);
      } else if (expenseData && Array.isArray(expenseData.data)) {
        setExpensesList(expenseData.data);
      } else {
        setExpensesList([]);
      }
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === "custom" && !customDate) return;
    fetchReports();
  }, [filter, customDate]);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense(expenseForm);
      alert("Pengeluaran berhasil dicatat!");
      setShowExpenseModal(false);
      setExpenseForm({ ...expenseForm, description: "", amount: "" });
      fetchReports();
    } catch (error) {
      alert("Gagal mencatat pengeluaran. Pastikan semua data terisi.");
    }
  };

  const handleDeleteExpense = async (id: number, desc: string) => {
    if (window.confirm(`Hapus catatan pengeluaran "${desc}"?`)) {
      try {
        await deleteExpense(id);
        fetchReports();
      } catch (error) {
        alert("Gagal menghapus catatan pengeluaran.");
      }
    }
  };

  const handleVoid = async (id: number, invoice: string) => {
    if (
      window.confirm(
        `⚠️ PERINGATAN VOID ⚠️\nBatalkan transaksi #${invoice}? Stok akan dikembalikan.`,
      )
    ) {
      try {
        await voidTransaction(id);
        alert(`Transaksi #${invoice} berhasil di-void!`);
        fetchReports();
      } catch (error) {
        alert("Gagal melakukan Void transaksi.");
      }
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blobData = await exportDashboardExcel(
        filter,
        filter === "custom" ? customDate : undefined,
      );
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Laporan_Keuangan_${filter}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Gagal mengunduh file Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- DATA PROCESSING ---
  const filteredTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return transactions;

    return transactions.filter((tx) => {
      // 👇 PERBAIKAN: Gunakan invoice_number
      const inv = tx.invoice_number
        ? String(tx.invoice_number).toLowerCase()
        : `inv-${String(tx.id).padStart(4, "0")}`;
      return inv.includes(term);
    });
  }, [transactions, searchTerm]);

  const filteredExpenses = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return expensesList;

    return expensesList.filter(
      (ex: any) =>
        (ex?.description || "").toLowerCase().includes(term) ||
        (ex?.category || "").toLowerCase().includes(term),
    );
  }, [expensesList, searchTerm]);

  const pieData = useMemo(() => {
    const productSales: Record<string, number> = {};
    (transactions || []).forEach((tx) => {
      (tx.details || []).forEach((detail: any) => {
        const name = detail.product?.name || "Item Dihapus";
        productSales[name] = (productSales[name] || 0) + detail.quantity;
      });
    });
    return Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  const revenueTrendData = useMemo(() => {
    const sorted = [...(transactions || [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const grouped: Record<string, number> = {};

    sorted.forEach((tx) => {
      const date = new Date(tx.created_at);
      let key =
        filter === "today" || filter === "custom"
          ? `${String(date.getHours()).padStart(2, "0")}:00`
          : date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
      grouped[key] = (grouped[key] || 0) + Number(tx.total_price);
    });

    return Object.entries(grouped).map(([time, revenue]) => ({
      time,
      revenue,
    }));
  }, [transactions, filter]);

  const COLORS = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#ffedd5"];

  return (
    <>
      <div className="font-sans pb-10 animate-fade-in max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-end border-b border-zinc-200 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Laporan Keuangan
            </h1>
            <p className="text-zinc-500 mt-1 font-medium">
              Analisis arus kas, cuan bersih, dan beban operasional.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm w-full sm:w-auto justify-center bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
            >
              <Plus size={20} weight="bold" /> Catat Pengeluaran
            </button>
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm w-full sm:w-auto justify-center ${isExporting ? "bg-zinc-400 text-zinc-100 cursor-wait" : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"}`}
            >
              <FloppyDisk size={20} weight="bold" />{" "}
              {isExporting ? "Memproses..." : "Ekspor Excel"}
            </button>
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-zinc-200 shadow-sm w-full sm:w-auto">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <CalendarBlank size={20} weight="bold" />
              </div>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  if (e.target.value !== "custom") setCustomDate("");
                }}
                className="bg-transparent font-bold text-zinc-700 outline-none cursor-pointer pr-4 text-sm w-full"
              >
                <option value="today">Hari Ini</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Tanggal Spesifik...</option>
              </select>
            </div>
            {filter === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm font-bold text-zinc-700 text-sm outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
              />
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-4 -top-4 bg-blue-50 w-24 h-24 rounded-full opacity-50"></div>
                <div>
                  <p className="text-sm font-bold text-zinc-400 uppercase mb-1 relative z-10 flex items-center gap-2">
                    <ArrowUpRight
                      size={18}
                      className="text-blue-500"
                      weight="bold"
                    />{" "}
                    Uang Masuk (Omzet)
                  </p>
                  <h3 className="text-2xl font-black text-zinc-800 relative z-10 truncate">
                    Rp {summary.revenue?.toLocaleString("id-ID")}
                  </h3>
                </div>
                <div className="mt-3 text-xs font-bold relative z-10 flex justify-between items-center border-t border-zinc-100 pt-2">
                  <span className="text-zinc-500">Total Nilai Diskon:</span>
                  <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                    - Rp {(summary.total_discount || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-4 -top-4 bg-red-50 w-24 h-24 rounded-full opacity-50"></div>
                <div>
                  <p className="text-sm font-bold text-red-400 uppercase mb-1 relative z-10 flex items-center gap-2">
                    <ArrowDownRight
                      size={18}
                      className="text-red-500"
                      weight="bold"
                    />{" "}
                    Total Kas Keluar
                  </p>
                  <h3 className="text-2xl font-black text-red-600 relative z-10 truncate">
                    - Rp {(summary.total_expense || 0).toLocaleString("id-ID")}
                  </h3>
                </div>
                <div className="mt-3 text-xs font-bold text-red-400 relative z-10 bg-red-50 w-max px-2 py-1 rounded-md">
                  Beban Operasional & Belanja
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-3xl shadow-lg shadow-green-600/20 text-white relative overflow-hidden flex flex-col justify-between">
                <Wallet
                  size={100}
                  weight="duotone"
                  className="absolute -right-4 -bottom-4 opacity-20"
                />
                <div>
                  <p className="text-sm font-bold text-green-100 uppercase mb-1 relative z-10 flex items-center gap-2">
                    <Money size={18} /> Laba Bersih (Cuan)
                  </p>
                  <h3 className="text-3xl font-black relative z-10 truncate">
                    Rp {(summary.net_profit || 0).toLocaleString("id-ID")}
                  </h3>
                </div>
                <div className="mt-3 text-xs font-bold text-green-100 relative z-10 bg-black/10 w-max px-2 py-1 rounded-md">
                  Omzet - HPP - Kas Keluar
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-4 -top-4 bg-purple-50 w-24 h-24 rounded-full opacity-50"></div>
                <div>
                  <p className="text-sm font-bold text-zinc-400 uppercase mb-1 relative z-10 flex items-center gap-2">
                    <Receipt size={18} /> Total Struk
                  </p>
                  <h3 className="text-2xl font-black text-zinc-800 relative z-10">
                    {summary.transactions_count} Transaksi
                  </h3>
                </div>
                <div
                  className={`mt-3 flex items-center gap-1 text-xs font-bold w-max px-2 py-1 rounded-md ${summary.transactions_count_change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {summary.transactions_count_change >= 0 ? (
                    <TrendUp weight="bold" />
                  ) : (
                    <TrendDown weight="bold" />
                  )}{" "}
                  {Math.abs(summary.transactions_count_change)}% dari lalu
                </div>
              </div>
            </div>

            {/* REKAP METODE PEMBAYARAN */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 mb-8">
              <h2 className="text-lg font-black text-zinc-800 mb-4 flex items-center gap-2">
                <LockKey size={24} className="text-zinc-500" /> Rekap Brankas
                (Closing Kasir)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-green-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl text-white flex items-center justify-center shadow-inner">
                    <Money size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                      Uang Fisik (Laci Kasir)
                    </p>
                    <h4 className="text-xl font-black text-green-700">
                      Rp{" "}
                      {(summary.payment_breakdown?.cash || 0).toLocaleString(
                        "id-ID",
                      )}
                    </h4>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl text-white flex items-center justify-center shadow-inner">
                    <QrCode size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Pembayaran QRIS
                    </p>
                    <h4 className="text-xl font-black text-blue-700">
                      Rp{" "}
                      {(summary.payment_breakdown?.qris || 0).toLocaleString(
                        "id-ID",
                      )}
                    </h4>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl text-white flex items-center justify-center shadow-inner">
                    <Bank size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                      Transfer Bank
                    </p>
                    <h4 className="text-xl font-black text-purple-700">
                      Rp{" "}
                      {(
                        summary.payment_breakdown?.transfer || 0
                      ).toLocaleString("id-ID")}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* TREN KEUANGAN & PIE CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-zinc-200 p-6">
                <h2 className="text-lg font-black text-zinc-800 mb-6 flex items-center gap-2">
                  <ChartLineUp size={24} className="text-green-500" /> Tren
                  Pendapatan
                </h2>
                <div className="w-full h-72">
                  {revenueTrendData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold bg-zinc-50 rounded-2xl">
                      Belum ada aliran kas
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueTrendData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#16a34a"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#16a34a"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f4f4f5"
                        />
                        <XAxis
                          dataKey="time"
                          tick={{
                            fontSize: 12,
                            fontWeight: "bold",
                            fill: "#a1a1aa",
                          }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tickFormatter={(val) => `Rp${val / 1000}k`}
                          tick={{ fontSize: 12, fill: "#a1a1aa" }}
                          axisLine={false}
                          tickLine={false}
                          width={80}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: any) => [
                            `Rp ${Number(value).toLocaleString("id-ID")}`,
                            "Pendapatan",
                          ]}
                          labelStyle={{
                            fontWeight: "bold",
                            color: "#3f3f46",
                            marginBottom: "4px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#16a34a"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-6 flex flex-col items-center">
                <h2 className="text-lg font-black text-zinc-800 w-full mb-6 flex items-center gap-2">
                  <ChartPieSlice
                    size={24}
                    className="text-orange-500"
                    weight="fill"
                  />{" "}
                  Porsi Menu Laris
                </h2>
                {pieData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-zinc-400 font-bold bg-zinc-50 rounded-2xl w-full">
                    Data kosong
                  </div>
                ) : (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
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
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontWeight: "bold",
                          }}
                          formatter={(value) => [`${value} Porsi`, "Terjual"]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          wrapperStyle={{
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* BUKU BESAR */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50">
                <div className="flex bg-zinc-200/50 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("income")}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "income" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  >
                    <ArrowUpRight
                      size={18}
                      className={activeTab === "income" ? "text-green-500" : ""}
                    />{" "}
                    Pemasukan
                  </button>
                  <button
                    onClick={() => setActiveTab("expense")}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "expense" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                  >
                    <ArrowDownRight
                      size={18}
                      className={activeTab === "expense" ? "text-red-500" : ""}
                    />{" "}
                    Pengeluaran
                  </button>
                </div>
                <div className="relative w-full sm:w-64">
                  <MagnifyingGlass
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    weight="bold"
                  />
                  <input
                    type="text"
                    placeholder={
                      activeTab === "income"
                        ? "Cari No. Invoice..."
                        : "Cari Keterangan..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto p-0">
                {activeTab === "income" && (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50">
                      <tr className="text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                        <th className="p-4 font-bold">Waktu</th>
                        <th className="p-4 font-bold">
                          No. Invoice & Pembayaran
                        </th>
                        <th className="p-4 font-bold text-right">Total Kas</th>
                        <th className="p-4 font-bold text-center">
                          Aksi Lanjutan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-zinc-400 font-bold"
                          >
                            Belum ada transaksi.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="hover:bg-green-50/30 transition-colors group"
                          >
                            <td className="p-4 text-zinc-500 font-medium">
                              {new Date(tx.created_at).toLocaleString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-4">
                              {/* 👇 PERBAIKAN: Gunakan invoice_number */}
                              <span className="font-bold text-zinc-800 bg-zinc-100 px-2 py-1 rounded-md text-xs mr-2">
                                #{tx.invoice_number || `INV-${tx.id}`}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-md ${tx.payment_method === "cash" ? "bg-green-100 text-green-700" : tx.payment_method === "qris" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                              >
                                {tx.payment_method?.toUpperCase() || "CASH"}
                              </span>
                            </td>
                            <td className="p-4 font-black text-green-600 text-right">
                              + Rp{" "}
                              {Number(tx.total_price).toLocaleString("id-ID")}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => setSelectedInvoice(tx)}
                                  className="text-xs font-bold bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-900 hover:text-white px-3 py-1.5 rounded-lg shadow-sm"
                                >
                                  Detail
                                </button>
                                {/* 👇 PERBAIKAN: Gunakan invoice_number */}
                                <button
                                  onClick={() =>
                                    handleVoid(tx.id, tx.invoice_number)
                                  }
                                  className="text-xs font-bold bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg shadow-sm"
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
                )}

                {activeTab === "expense" && (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-red-50/50">
                      <tr className="text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
                        <th className="p-4 font-bold">Tanggal</th>
                        <th className="p-4 font-bold">Kategori & Keterangan</th>
                        <th className="p-4 font-bold text-right">
                          Nominal Keluar
                        </th>
                        <th className="p-4 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-zinc-400 font-bold"
                          >
                            Belum ada catatan pengeluaran.
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((ex) => (
                          <tr
                            key={ex.id}
                            className="hover:bg-red-50/30 transition-colors group"
                          >
                            <td className="p-4 text-zinc-500 font-medium">
                              {new Date(ex.expense_date).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-zinc-800">
                                {ex.description}
                              </p>
                              <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                {ex.category}
                              </span>
                            </td>
                            <td className="p-4 font-black text-red-500 text-right">
                              - Rp {Number(ex.amount).toLocaleString("id-ID")}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() =>
                                  handleDeleteExpense(ex.id, ex.description)
                                }
                                className="text-xs font-bold bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg shadow-sm"
                              >
                                <Trash size={16} weight="bold" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL CATAT PENGELUARAN */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 bg-zinc-100 rounded-full p-1 transition-colors"
            >
              <X size={20} weight="bold" />
            </button>
            <div className="p-6 border-b border-zinc-100 bg-zinc-50">
              <h2 className="text-xl font-black text-zinc-800 flex items-center gap-2">
                <Coins size={24} className="text-red-500" /> Catat Kas Keluar
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Catat belanja operasional atau bahan baku.
              </p>
            </div>
            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Tanggal Keluar
                </label>
                <input
                  type="date"
                  required
                  value={expenseForm.expense_date}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      expense_date: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Operasional">
                    Operasional (Listrik, Air, Wifi)
                  </option>
                  <option value="Bahan Baku">Beli Bahan Baku</option>
                  <option value="Gaji Pegawai">Gaji Karyawan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Keterangan Detail
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Es Batu 2 Karung"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Nominal Uang Keluar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="50000"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        amount: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 pl-12 text-sm font-black focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/30 transition-all flex justify-center items-center gap-2"
                >
                  <FloppyDisk size={20} weight="bold" /> Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL STRUK DIGITAL */}
      {selectedInvoice &&
        (() => {
          const totalBelanja = Number(selectedInvoice.total_price) || 0;
          const tunai =
            Number(selectedInvoice.pay_amount || selectedInvoice.amount_paid) ||
            totalBelanja;
          const kembalian = tunai > totalBelanja ? tunai - totalBelanja : 0;
          // 👇 PERBAIKAN: Gunakan invoice_number
          const noInvoice = selectedInvoice.invoice_number
            ? selectedInvoice.invoice_number
            : `INV-${String(selectedInvoice.id).padStart(4, "0")}`;

          return (
            <div className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col font-mono text-sm relative">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 bg-zinc-100 rounded-full p-1 transition-colors"
                >
                  <X size={20} weight="bold" />
                </button>
                <div className="p-8 pb-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">
                      KOPI KITA
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1">
                      Salinan Struk Digital
                    </p>
                  </div>
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
                  <div className="border-t border-dashed border-zinc-300 pt-3 space-y-1">
                    <div className="flex justify-between text-zinc-600 font-bold">
                      <p>Total Belanja</p>
                      <p>Rp {totalBelanja.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <p>Tunai Masuk</p>
                      <p>Rp {tunai.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex justify-between text-zinc-800 font-black text-base mt-2 pt-2 border-t border-zinc-200">
                      <p>KEMBALIAN</p>
                      <p>Rp {kembalian.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="text-center mt-4 pt-4 border-t border-zinc-100">
                      <p className="text-xs text-zinc-400">
                        Pembayaran via{" "}
                        {selectedInvoice.payment_method?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 border-t border-zinc-200 p-4 flex justify-center gap-4 font-sans">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    <Printer size={18} weight="bold" /> Cetak / Print
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
