import { useEffect, useState } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getCategories,
  addCategory,
  bulkUpdateStock,
  getStockLogs,
} from "../services/product";
import {
  Plus,
  Coffee,
  Package,
  Hash,
  Pencil,
  Tag,
  X,
  MagnifyingGlass,
  Funnel,
  Trash,
  Image as ImageIcon,
  Power,
  Stack,
  ClockCounterClockwise,
  FloppyDisk,
} from "phosphor-react";

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 STATE BARU: BULK UPDATE & STOCK LOGS
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState<any[]>([]);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  const [showLogsModal, setShowLogsModal] = useState(false);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      if (categoryData.length > 0 && !categoryId)
        setCategoryId(categoryData[0].id.toString());
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      filterCategory === "all" || p.category_id.toString() === filterCategory;
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // FUNGSI UMUM (Tambah, Edit, Delete, Toggle, Kategori) - SAMA SEPERTI SEBELUMNYA
  const handleAddCategory = async (e: React.FormEvent) => {
    /* ... kode lama ... */ e.preventDefault();
    try {
      await addCategory(newCategoryName);
      alert("Kategori ditambahkan!");
      setNewCategoryName("");
      setShowCategoryForm(false);
      fetchData();
    } catch (error) {
      alert("Gagal.");
    }
  };
  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setPrice("");
    setStock("0");
    setImage(null);
  };
  const handleEditClick = (product: any) => {
    setEditId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategoryId(product.category_id.toString());
    setImage(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleSaveMenu = async (e: React.FormEvent) => {
    /* ... kode lama ... */ e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category_id", categoryId);
      if (image) formData.append("image", image);
      if (editId) {
        await updateProduct(editId, formData);
        alert("Menu diupdate!");
      } else {
        await addProduct(formData);
        alert("Menu ditambahkan!");
      }
      handleCancelForm();
      fetchData();
    } catch (error) {
      alert("Gagal simpan.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id: number, productName: string) => {
    if (window.confirm(`Hapus "${productName}" permanen?`)) {
      try {
        await deleteProduct(id);
        fetchData();
      } catch (error) {
        alert("Gagal hapus.");
      }
    }
  };
  const handleToggleStatus = async (id: number) => {
    try {
      await toggleProductStatus(id);
      fetchData();
    } catch (error) {
      alert("Gagal ubah status.");
    }
  };

  // 🔥 FUNGSI BARU: Buka Modal Bulk Update
  const handleOpenBulkModal = () => {
    // Tarik data menu saat ini ke dalam state bulk
    setBulkData(
      products.map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
    );
    setShowBulkModal(true);
  };

  // 🔥 FUNGSI BARU: Simpan Bulk Update
  const handleSaveBulkUpdate = async () => {
    setIsSavingBulk(true);
    try {
      // Kita bersihkan data: pastikan ID ada dan stok adalah angka (Number)
      const payload = bulkData
        .filter((item) => item.id !== undefined) // Pastikan ID ada
        .map((item) => ({
          id: Number(item.id),
          stock: item.stock === "" ? 0 : Number(item.stock), // Kalau kosong jadikan 0
        }));

      console.log("Data yang dikirim ke backend:", { stocks: payload }); // Buat intip di console

      await bulkUpdateStock(payload);

      alert("Stok massal berhasil diupdate! 📦");
      setShowBulkModal(false);
      fetchData();
    } catch (error: any) {
      // Intip error detail dari Laravel
      console.error("Error 422 Detail:", error.response?.data);
      alert(
        "Gagal: " +
          (error.response?.data?.message || "Cek kembali isian stok Anda."),
      );
    } finally {
      setIsSavingBulk(false);
    }
  };

  // 🔥 FUNGSI BARU: Buka Modal Riwayat Stok
  const handleOpenLogsModal = async () => {
    setShowLogsModal(true);
    setLoadingLogs(true);
    try {
      const logs = await getStockLogs();
      setStockLogs(logs);
    } catch (error) {
      console.error("Gagal ambil log");
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="font-sans pb-10 relative">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-zinc-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Kelola Menu & Stok
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Atur daftar produk, gambar, dan ketersediaan stok
          </p>
        </div>
        {/* 🔥 TAMBAHAN TOMBOL DI HEADER */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenLogsModal}
            className="bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm"
          >
            <ClockCounterClockwise size={18} weight="bold" /> Riwayat Stok
          </button>
          <button
            onClick={handleOpenBulkModal}
            className="bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm"
          >
            <Stack size={18} weight="bold" /> Update Stok Cepat
          </button>
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="bg-white border border-zinc-200 text-zinc-700 hover:border-orange-500 hover:text-orange-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm text-sm"
          >
            <Tag size={18} weight="bold" /> Kategori Baru
          </button>
          <button
            onClick={() => {
              showForm && !editId
                ? handleCancelForm()
                : (handleCancelForm(), setShowForm(true));
            }}
            className={`${showForm && !editId ? "bg-red-500 hover:bg-red-600" : "bg-zinc-900 hover:bg-orange-600"} text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg text-sm`}
          >
            {showForm && !editId ? (
              <X size={18} weight="bold" />
            ) : (
              <Plus size={18} weight="bold" />
            )}
            {showForm && !editId ? "Batal Tambah" : "Menu Baru"}
          </button>
        </div>
      </header>

      {/* FORM TAMBAH KATEGORI & MENU (Disingkat karna sama seperti sebelumnya) */}
      {showCategoryForm && (
        <div className="bg-orange-50 p-6 rounded-2xl shadow-sm border border-orange-200 mb-6 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-orange-800 mb-2">
              Nama Kategori Baru
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full p-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={!newCategoryName}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold p-3 rounded-xl px-8"
          >
            Simpan
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              {editId ? (
                <Pencil size={24} className="text-blue-500" />
              ) : (
                <Coffee size={24} className="text-orange-500" />
              )}{" "}
              {editId ? "Edit Detail Menu" : "Buat Menu Baru"}
            </h2>
            {editId && (
              <button
                onClick={handleCancelForm}
                className="text-zinc-400 hover:text-red-500 font-bold bg-zinc-100 px-3 py-1 rounded-lg"
              >
                Batal Edit
              </button>
            )}
          </div>
          <form
            onSubmit={handleSaveMenu}
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">Nama Menu</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-2">Harga</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-2">Stok</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-2">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-2">Gambar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files ? e.target.files[0] : null)
                }
                className="w-full text-xs text-zinc-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700"
              />
            </div>
            <div className="md:col-span-6 mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold p-3 rounded-xl"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH & FILTER (Sama seperti sebelumnya) */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Funnel size={20} weight="bold" />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent font-bold text-zinc-700 outline-none cursor-pointer pr-4"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative w-full md:w-96">
          <MagnifyingGlass
            className="absolute left-3 top-3.5 text-zinc-400"
            size={20}
            weight="bold"
          />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-sm"
          />
        </div>
      </div>

      {/* TABEL DAFTAR MENU (Sama seperti sebelumnya, disingkat visualnya) */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="p-4 font-bold text-zinc-500 text-xs uppercase w-16 text-center">
                Img
              </th>
              <th className="p-4 font-bold text-zinc-500 text-xs uppercase">
                Produk
              </th>
              <th className="p-4 font-bold text-zinc-500 text-xs uppercase">
                Harga
              </th>
              <th className="p-4 font-bold text-zinc-500 text-xs uppercase text-center">
                Stok & Status
              </th>
              <th className="p-4 font-bold text-zinc-500 text-xs uppercase text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-400">
                  Memuat...
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-zinc-50 ${item.status === "habis" ? "opacity-60 bg-zinc-50" : ""}`}
                >
                  <td className="p-4 text-center">
                    <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden mx-auto">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon
                          size={20}
                          className="m-auto mt-3 text-zinc-300"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <h3 className="font-extrabold text-zinc-800">
                      {item.name}
                    </h3>
                    <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded uppercase font-bold text-zinc-500">
                      {item.category?.name}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-orange-600">
                    Rp {Number(item.price).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded-md">
                        Stok: {item.stock}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.status === "tersedia" ? "bg-green-50 text-green-600 border-green-200" : "bg-zinc-200 text-zinc-500 border-zinc-300"}`}
                      >
                        {item.status === "tersedia" ? "Aktif" : "Non-Aktif"}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white"
                      >
                        <Pencil size={16} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white"
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

      {/* =========================================
                🔥 MODAL 1: BULK UPDATE STOK 
            ============================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                <Stack size={28} className="text-blue-600" /> Update Stok Massal
              </h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-zinc-400 hover:text-red-500 p-2"
              >
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-12 gap-4 mb-2 font-bold text-sm text-zinc-500 uppercase tracking-wider px-2">
                <div className="col-span-8">Nama Menu</div>
                <div className="col-span-4 text-right">Stok Fisik</div>
              </div>
              {bulkData.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center mb-3 bg-white border border-zinc-200 p-3 rounded-xl hover:border-blue-300 transition-colors"
                >
                  <div className="col-span-8 font-bold text-zinc-800 truncate">
                    {item.name}
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={item.stock}
                      onChange={(e) => {
                        const newData = [...bulkData];
                        newData[index].stock = e.target.value;
                        setBulkData(newData);
                      }}
                      className="w-full p-2 bg-blue-50 text-blue-700 font-black border border-blue-200 rounded-lg text-right outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBulkUpdate}
                disabled={isSavingBulk}
                className="px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                {isSavingBulk ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <FloppyDisk size={20} weight="bold" /> Simpan Massal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
                🔥 MODAL 2: RIWAYAT STOK (STOCK LOGS) 
            ============================================= */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <h2 className="text-2xl font-black text-zinc-800 flex items-center gap-2">
                <ClockCounterClockwise size={28} className="text-orange-500" />{" "}
                Riwayat Perubahan Stok
              </h2>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-zinc-400 hover:text-red-500 p-2"
              >
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {loadingLogs ? (
                <p className="text-center py-10 text-zinc-400 font-bold animate-pulse">
                  Memuat riwayat...
                </p>
              ) : stockLogs.length === 0 ? (
                <p className="text-center py-10 text-zinc-400 font-bold">
                  Belum ada riwayat perubahan stok.
                </p>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-500 uppercase tracking-wider">
                      <th className="p-3 font-bold rounded-tl-lg">Waktu</th>
                      <th className="p-3 font-bold">Menu</th>
                      <th className="p-3 font-bold">Aktor</th>
                      <th className="p-3 font-bold text-center">Perubahan</th>
                      <th className="p-3 font-bold rounded-tr-lg">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stockLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-zinc-50">
                        <td className="p-3 text-zinc-500">
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 font-bold text-zinc-800">
                          {log.product?.name || "Menu Dihapus"}
                        </td>
                        <td className="p-3 font-medium text-zinc-600">
                          {log.user?.name || "Sistem"}
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-xs font-bold text-zinc-400 line-through mr-2">
                            {log.old_stock}
                          </span>
                          <span className="font-black text-zinc-800 mr-2">
                            ➔
                          </span>
                          <span
                            className={`font-black ${log.changed_amount > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {log.new_stock}
                          </span>
                          <span
                            className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded ${log.changed_amount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {log.changed_amount > 0 ? "+" : ""}
                            {log.changed_amount}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                            {log.type.replace("_", " ")}
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
      )}
    </div>
  );
}
