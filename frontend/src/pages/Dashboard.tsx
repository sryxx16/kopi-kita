import { useEffect, useState } from "react";
import { getProducts, addProduct } from "../services/product";
import { Plus, Coffee, Package, Hash } from "phosphor-react";

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Form Tambah Menu
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("1"); // Default 1 (Kopi)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi ambil data (Refresh Tabel)
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Gagal mengambil menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Fungsi Submit Form
  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addProduct({
        name: newName,
        price: Number(newPrice),
        category_id: Number(newCategory),
      });
      alert("Mantap! Menu baru berhasil ditambahkan 🚀");

      // Bersihkan form & refresh tabel
      setNewName("");
      setNewPrice("");
      setShowForm(false);
      fetchMenu();
    } catch (error) {
      alert("Gagal menambahkan menu. Cek kembali isian Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans">
      <header className="mb-8 flex justify-between items-end border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Kelola Menu
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Tambah dan pantau daftar menu di kedai Anda
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-zinc-900 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
        >
          <Plus size={20} weight="bold" />
          {showForm ? "Batal Tambah" : "Menu Baru"}
        </button>
      </header>

      {/* AREA FORM TAMBAH MENU (Muncul kalau tombol diklik) */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <Coffee size={24} className="text-orange-500" /> Detail Menu Baru
          </h2>
          <form
            onSubmit={handleAddMenu}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Nama Menu
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Kopi Pandan"
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Harga (Rp)
              </label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="15000"
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Kategori
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium text-zinc-700"
              >
                {/* Ingat ID dari DatabaseSeeder: 1=Kopi, 2=Non-Kopi, 3=Snack */}
                <option value="1">Kopi</option>
                <option value="2">Non-Kopi</option>
                <option value="3">Snack</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold p-3 rounded-xl transition-all"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Menu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL DAFTAR MENU */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Hash size={16} /> ID
                </th>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                  Kategori
                </th>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                  Harga
                </th>
                <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-zinc-400 font-medium animate-pulse"
                  >
                    Memuat data menu...
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="p-4 text-zinc-500 font-medium">
                      #{item.id}
                    </td>
                    <td className="p-4 font-bold text-zinc-800 flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-zinc-400" />
                      </div>
                      {item.name}
                    </td>
                    <td className="p-4">
                      <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {item.category?.name || "Lainnya"}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-orange-600">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                        {item.status}
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
