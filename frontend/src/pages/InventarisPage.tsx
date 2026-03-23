import { useEffect, useState } from "react";
import {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
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
} from "phosphor-react";

export default function InventarisPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("Gram");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name);
    setStock(item.stock);
    setUnit(item.unit);
    setLowStockThreshold(item.low_stock_threshold);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        stock: Number(stock),
        unit,
        low_stock_threshold: Number(lowStockThreshold),
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
    } catch (error) {
      alert("Gagal menyimpan bahan baku.");
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

  // Ringkasan Stok
  const kritisCount = materials.filter(
    (m) => Number(m.stock) <= Number(m.low_stock_threshold),
  ).length;

  return (
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

      {/* FORM TAMBAH / EDIT */}
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
              <label className="block text-sm font-bold mb-2">Nama Bahan</label>
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

      {/* ALERT KRITIS */}
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

      {/* TABEL INVENTARIS */}
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
                          onClick={() => handleEdit(m)}
                          className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                        >
                          <Pencil size={18} weight="bold" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg"
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
  );
}
