import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../services/setting";
import { Storefront, MapPin, Phone, Percent, FloppyDisk } from "phosphor-react";

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    store_phone: "",
    tax_percentage: 0,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        setFormData({
          store_name: data.store_name || "",
          store_address: data.store_address || "",
          store_phone: data.store_phone || "",
          tax_percentage: data.tax_percentage || 0,
        });
      } catch (error) {
        console.error("Gagal mengambil pengaturan", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSettings({
        ...formData,
        tax_percentage: Number(formData.tax_percentage),
      });
      alert("Mantap! Pengaturan Toko berhasil diperbarui 💾");
    } catch (error) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-zinc-400 font-bold animate-pulse">
          Memuat pengaturan...
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans pb-10 animate-fade-in max-w-4xl mx-auto">
      <header className="mb-8 border-b border-zinc-200 pb-5">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Pengaturan Toko
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">
          Atur identitas kedai dan pajak (PPN) yang akan tampil di struk kasir.
        </p>
      </header>

      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom Nama Toko */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Nama Kedai / Toko
            </label>
            <div className="relative">
              <Storefront
                className="absolute left-4 top-3.5 text-zinc-400"
                size={24}
              />
              <input
                type="text"
                name="store_name"
                required
                value={formData.store_name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-zinc-800 text-lg"
              />
            </div>
          </div>

          {/* Kolom No Telepon */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Nomor Telepon / WA
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-3.5 text-zinc-400"
                size={24}
              />
              <input
                type="text"
                name="store_phone"
                value={formData.store_phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800 text-lg"
              />
            </div>
          </div>

          {/* Kolom Alamat (Full Width) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Alamat Lengkap Kedai
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-4 top-4 text-zinc-400"
                size={24}
              />
              <textarea
                name="store_address"
                rows={3}
                value={formData.store_address}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800 text-base resize-none"
              ></textarea>
            </div>
          </div>

          {/* Kolom PPN */}
          <div className="md:col-span-2 p-6 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-orange-800 text-lg">
                Pajak Pertambahan Nilai (PPN)
              </h3>
              <p className="text-orange-600 text-sm font-medium">
                Berapa persen pajak yang akan dibebankan ke pelanggan pada
                setiap transaksi?
              </p>
            </div>
            <div className="relative w-full md:w-32 flex-shrink-0">
              <Percent
                className="absolute right-4 top-3.5 text-orange-500"
                size={20}
                weight="bold"
              />
              <input
                type="number"
                name="tax_percentage"
                min="0"
                max="100"
                value={formData.tax_percentage}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-orange-700 text-xl text-center"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end pt-6 border-t border-zinc-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg text-lg"
          >
            <FloppyDisk size={24} weight="fill" />
            {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
