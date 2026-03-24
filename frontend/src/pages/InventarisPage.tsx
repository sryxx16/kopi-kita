import { useEffect, useState } from "react";
import {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  restockInventory,
} from "../services/inventory";
import {
  Package,
  Plus,
  WarningCircle,
  CheckCircle,
  Pencil,
  Trash,
  X,
  Scales,
  ArrowDown,
  Money,
} from "phosphor-react";

export default function InventarisPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State Induk
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("Gram");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Form State Tambahan untuk Laporan Keuangan (Barang Baru)
  const [recordNewExpense, setRecordNewExpense] = useState(false);
  const [newExpenseCost, setNewExpenseCost] = useState("");

  // Form State Restock
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockItem, setRestockItem] = useState<any>(null);
  const [addedStock, setAddedStock] = useState("");
  const [restockCost, setRestockCost] = useState("");
  const [recordExpense, setRecordExpense] = useState(true);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setMaterials(data);
    } catch (error) {
      console.error("Gagal load inventaris", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setStock("");
    setUnit("Gram");
    setLowStockThreshold("10");
    setRecordNewExpense(false);
    setNewExpenseCost(""); // Reset statenya
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name);
    setStock(item.stock);
    setUnit(item.unit);
    setLowStockThreshold(item.low_stock_threshold);
    setRecordNewExpense(false); // Kalau mode edit, sembunyikan pencatatan keuangan
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 VALIDASI: Cek apakah nama bahan baku sudah ada (Biar gak dobel)
    const namaSama = materials.find(
      (m) =>
        m.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        m.id !== editId,
    );

    if (namaSama) {
      alert(
        `Peringatan: Bahan baku "${name}" sudah ada di gudang! Silakan edit stok yang sudah ada atau gunakan nama lain.`,
      );
      return; // Berhenti di sini, jangan kirim ke database
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        stock: Number(stock),
        unit,
        low_stock_threshold: Number(lowStockThreshold),
        record_expense: !editId ? recordNewExpense : false, // Kirim status checkbox
        cost: !editId && recordNewExpense ? Number(newExpenseCost) : 0, // Kirim harganya
      };

      if (editId) {
        await updateInventory(editId, payload);
        alert("Bahan baku diupdate!");
      } else {
        await addInventory(payload);
        alert("Bahan baku baru ditambahkan!");
      }
      handleCancel();
      fetchMaterials();
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || "Gagal menyimpan bahan baku.";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, itemName: string) => {
    if (window.confirm(`Yakin mau menghapus "${itemName}" dari inventaris?`)) {
      try {
        await deleteInventory(id);
        fetchMaterials();
      } catch (error) {
        alert("Gagal menghapus.");
      }
    }
  };

  const handleSaveRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    setIsSubmitting(true);
    try {
      await restockInventory(restockItem.id, {
        added_stock: Number(addedStock),
        cost: Number(restockCost),
        record_expense: recordExpense,
      });
      alert(
        `Berhasil menambah ${addedStock} ${restockItem.unit} ${restockItem.name}!`,
      );
      setShowRestockModal(false);
      setRestockItem(null);
      setAddedStock("");
      setRestockCost("");
      fetchMaterials();
    } catch (error) {
      alert("Gagal melakukan restock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const kritisCount = materials.filter(
    (m) => Number(m.stock) <= Number(m.low_stock_threshold),
  ).length;

  return (
    <>
      <div className="font-sans pb-10 animate-fade-in">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-zinc-200 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
              Gudang Bahan Baku
            </h1>
            <p className="text-zinc-500 mt-1 font-medium">
              Pantau dan kelola stok mentah kedai Anda
            </p>
          </div>
          <button
            onClick={() => {
              showForm && !editId
                ? handleCancel()
                : (handleCancel(), setShowForm(true));
            }}
            className={`${showForm && !editId ? "bg-red-500 hover:bg-red-600" : "bg-zinc-900 hover:bg-orange-600"} text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg`}
          >
            {showForm && !editId ? (
              <X size={20} weight="bold" />
            ) : (
              <Plus size={20} weight="bold" />
            )}
            {showForm && !editId ? "Batal" : "Bahan Baru"}
          </button>
        </header>

        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8">
            <h2 className="text-xl font-extrabold text-zinc-800 mb-6 flex items-center gap-2 border-b border-zinc-100 pb-4">
              <Package size={24} className="text-orange-500" />{" "}
              {editId ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
            </h2>
            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div>
                <label className="block text-sm font-bold mb-2">
                  Nama Bahan
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Biji Kopi Arabika"
                  className="w-full p-3 bg-zinc-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Stok Saat Ini
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 bg-zinc-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Satuan (Unit)
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Gram">Gram</option>
                  <option value="Kg">Kg</option>
                  <option value="Ml">Ml</option>
                  <option value="Liter">Liter</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-red-500">
                  Batas Kritis (Alert)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="Contoh: 500"
                  className="w-full p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* 🔥 CHECKBOX SAKTI UNTUK BARANG BARU 🔥 */}
              {!editId && (
                <div className="md:col-span-4 bg-orange-50 p-4 rounded-xl border border-orange-100 mt-2">
                  <label className="flex items-start gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={recordNewExpense}
                      onChange={(e) => setRecordNewExpense(e.target.checked)}
                      className="mt-1 w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-orange-800 flex items-center gap-1">
                        <Money
                          size={16}
                          className="text-orange-600"
                          weight="fill"
                        />{" "}
                        Catat otomatis ke Laporan Pengeluaran?
                      </p>
                      <p className="text-xs text-orange-600 mt-0.5">
                        Sistem akan memotong uang kas toko untuk pembelian
                        barang awal ini.
                      </p>
                    </div>
                  </label>

                  {recordNewExpense && (
                    <div className="relative w-full md:w-1/2 animate-fade-in">
                      <label className="block text-xs font-bold text-orange-800 mb-1">
                        Total Biaya Beli / Kulakan Awal
                      </label>
                      <span className="absolute left-4 top-8 font-black text-orange-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        required={recordNewExpense}
                        value={newExpenseCost}
                        onChange={(e) => setNewExpenseCost(e.target.value)}
                        placeholder="Contoh: 150000"
                        className="w-full bg-white border border-orange-200 text-orange-900 rounded-xl p-3 pl-12 text-sm font-black focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="md:col-span-4 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold p-3 rounded-xl transition-all h-[50px] shadow-lg"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Bahan Baku"}
                </button>
              </div>
            </form>
          </div>
        )}

        {kritisCount > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 flex items-center gap-3">
            <WarningCircle
              size={28}
              className="text-red-500 animate-pulse"
              weight="fill"
            />
            <div>
              <p className="font-bold text-red-800">
                Perhatian! Ada {kritisCount} bahan baku yang stoknya menipis.
              </p>
              <p className="text-sm text-red-600">
                Segera hubungi supplier untuk melakukan restock.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase">
                  Bahan Baku
                </th>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase text-right">
                  Stok Fisik
                </th>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase text-center">
                  Status Gudang
                </th>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-zinc-400 font-bold animate-pulse"
                  >
                    Mengecek gudang...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-zinc-400 font-bold"
                  >
                    Gudang kosong. Tambahkan bahan baku pertama Anda!
                  </td>
                </tr>
              ) : (
                materials.map((m) => {
                  const isKritis =
                    Number(m.stock) <= Number(m.low_stock_threshold);
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50">
                      <td className="p-4 font-bold text-zinc-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Scales size={20} weight="fill" />
                        </div>
                        {m.name}
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xl font-black text-zinc-800 mr-1">
                          {m.stock}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase">
                          {m.unit}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isKritis ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"}`}
                        >
                          {isKritis ? (
                            <>
                              <WarningCircle weight="fill" /> Kritis
                            </>
                          ) : (
                            <>
                              <CheckCircle weight="fill" /> Aman
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setRestockItem(m);
                              setShowRestockModal(true);
                            }}
                            className="px-3 h-9 flex items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-bold text-xs transition-colors"
                          >
                            <ArrowDown size={16} weight="bold" /> Restock
                          </button>
                          <button
                            onClick={() => handleEdit(m)}
                            className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                          >
                            <Pencil size={18} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                          >
                            <Trash size={18} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL RESTOCK PINTAR */}
      {showRestockModal && restockItem && (
        <div className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
            <button
              onClick={() => {
                setShowRestockModal(false);
                setRestockItem(null);
                setAddedStock("");
                setRestockCost("");
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 bg-zinc-100 rounded-full p-1 transition-colors"
            >
              <X size={20} weight="bold" />
            </button>

            <div className="p-6 border-b border-zinc-100 bg-green-50">
              <h2 className="text-xl font-black text-green-800 flex items-center gap-2">
                <ArrowDown size={24} className="text-green-600" weight="bold" />{" "}
                Restock Bahan Baku
              </h2>
              <p className="text-green-700 text-sm mt-1 font-medium">
                Tambah stok{" "}
                <span className="font-black text-green-900">
                  {restockItem.name}
                </span>{" "}
                ke gudang.
              </p>
            </div>

            <form onSubmit={handleSaveRestock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Jumlah Barang Masuk ({restockItem.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={addedStock}
                  onChange={(e) => setAddedStock(e.target.value)}
                  placeholder={`Contoh: 10`}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">
                  Total Biaya Belanja / Kulakan
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={restockCost}
                    onChange={(e) => setRestockCost(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 pl-12 text-sm font-black focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 mt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordExpense}
                    onChange={(e) => setRecordExpense(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-600 rounded border-zinc-300 focus:ring-green-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-zinc-800 flex items-center gap-1">
                      <Money
                        size={16}
                        className="text-green-600"
                        weight="fill"
                      />{" "}
                      Catat otomatis ke Pengeluaran
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Sistem akan memotong kas toko di Laporan Keuangan.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-600/30 transition-all flex justify-center items-center gap-2"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan & Update Gudang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
