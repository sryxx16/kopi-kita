import { useEffect, useState } from "react";
import {
  getPromos,
  addPromo,
  updatePromo,
  deletePromo,
} from "../services/promo";
import { Ticket, Plus, Tag, Pencil, Trash, X, Power } from "phosphor-react";

export default function PromoPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [validUntil, setValidUntil] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const data = await getPromos();
      setPromos(data);
    } catch (error) {
      console.error("Gagal load promo", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setIsActive(true);
    setValidUntil("");
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name);
    setCode(item.code);
    setDiscountType(item.discount_type);
    setDiscountValue(item.discount_value);
    setIsActive(item.is_active === 1 || item.is_active === true);
    setValidUntil(item.valid_until || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        is_active: isActive,
        valid_until: validUntil || null,
      };
      if (editId) {
        await updatePromo(editId, payload);
        alert("Promo diupdate!");
      } else {
        await addPromo(payload);
        alert("Voucher baru berhasil dibuat!");
      }
      handleCancel();
      fetchPromos();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Gagal menyimpan. Cek apakah kode sudah terpakai.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, kode: string) => {
    if (window.confirm(`Hapus voucher ${kode} permanen?`)) {
      try {
        await deletePromo(id);
        fetchPromos();
      } catch (error) {
        alert("Gagal menghapus.");
      }
    }
  };

  // Fungsi toggle status cepat
  const handleToggleStatus = async (item: any) => {
    try {
      await updatePromo(item.id, { ...item, is_active: !item.is_active });
      fetchPromos();
    } catch (error) {
      alert("Gagal ubah status.");
    }
  };

  return (
    <div className="font-sans pb-10 animate-fade-in">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-zinc-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Manajemen Promo
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Buat kode voucher diskon untuk pelanggan Kopi Kita
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
          {showForm && !editId ? "Batal" : "Buat Voucher Baru"}
        </button>
      </header>

      {/* FORM TAMBAH / EDIT */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')]">
          <h2 className="text-xl font-extrabold text-zinc-800 mb-6 flex items-center gap-2 border-b border-zinc-100 pb-4 bg-white/80 backdrop-blur-sm">
            <Ticket size={24} className="text-orange-500" />{" "}
            {editId ? "Edit Voucher Promo" : "Desain Voucher Baru"}
          </h2>
          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white/80 backdrop-blur-sm p-2 rounded-xl"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">Nama Promo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Promo Kemerdekaan"
                className="w-full p-3 bg-zinc-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">
                Kode Voucher
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MERDEKA45"
                className="w-full p-3 bg-zinc-50 border rounded-xl font-black text-orange-600 uppercase outline-none focus:ring-2 focus:ring-orange-500 tracking-widest"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-2">
                Jenis Diskon
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="percentage">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-2">
                Nilai Diskon
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "10" : "15000"}
                className="w-full p-3 bg-zinc-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-bold mb-2">
                Berlaku Sampai (Opsional)
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-3 bg-zinc-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-3 flex items-end mb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-zinc-300"}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isActive ? "transform translate-x-6" : ""}`}
                  ></div>
                </div>
                <span className="font-bold text-zinc-700">
                  Promo Aktif / Bisa Dipakai
                </span>
              </label>
            </div>

            <div className="md:col-span-6 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg text-lg flex justify-center items-center gap-2"
              >
                <Ticket size={24} weight="fill" />{" "}
                {isSubmitting ? "Menyimpan..." : "Simpan & Terbitkan Voucher"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DAFTAR VOUCHER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-10 text-center font-bold text-zinc-400">
            Melacak data promo...
          </div>
        ) : promos.length === 0 ? (
          <div className="col-span-full py-10 text-center font-bold text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl">
            Belum ada promo yang dibuat. Ayo buat diskon pertamamu! 🎉
          </div>
        ) : (
          promos.map((promo) => {
            const isExpired =
              promo.valid_until && new Date(promo.valid_until) < new Date();
            const isActive = promo.is_active === 1 || promo.is_active === true;
            const isUsable = isActive && !isExpired;

            return (
              <div
                key={promo.id}
                className={`relative bg-white rounded-3xl p-6 shadow-sm border transition-all hover:shadow-md overflow-hidden ${!isUsable ? "opacity-60 grayscale-[50%] border-zinc-200" : "border-orange-200"}`}
              >
                {/* Gerigi pinggiran voucher */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-50 rounded-full border-r border-zinc-200"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-50 rounded-full border-l border-zinc-200"></div>

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl">
                    <Tag size={28} weight="fill" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-zinc-800 tracking-tighter">
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}%`
                        : `Rp ${Number(promo.discount_value).toLocaleString("id-ID")}`}
                    </h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase">
                      Nilai Potongan
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-bold text-zinc-500 mb-1">
                    {promo.name}
                  </p>
                  <div className="inline-block border-2 border-dashed border-orange-400 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-mono font-black tracking-widest text-lg">
                    {promo.code}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-100 pt-4">
                  <div className="text-xs font-bold">
                    {isExpired ? (
                      <span className="text-red-500">❌ Kadaluarsa</span>
                    ) : promo.valid_until ? (
                      <span className="text-zinc-500">
                        S/d:{" "}
                        {new Date(promo.valid_until).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                    ) : (
                      <span className="text-green-500">Tanpa Batas Waktu</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleStatus(promo)}
                      title={isActive ? "Nonaktifkan" : "Aktifkan"}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${isActive ? "bg-green-100 text-green-600 hover:bg-red-100 hover:text-red-600" : "bg-zinc-200 text-zinc-500 hover:bg-green-100 hover:text-green-600"}`}
                    >
                      <Power size={16} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleEdit(promo)}
                      className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded flex items-center justify-center transition-colors"
                    >
                      <Pencil size={16} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id, promo.code)}
                      className="w-8 h-8 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded flex items-center justify-center transition-colors"
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
