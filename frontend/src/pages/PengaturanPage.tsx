import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../services/setting";
import {
  Storefront,
  MapPin,
  Phone,
  Percent,
  FloppyDisk,
  Bank,
  IdentificationCard,
  QrCode,
  Image as ImageIcon,
} from "phosphor-react";

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    store_phone: "",
    tax_percentage: 0,
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  const [qrisImage, setQrisImage] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const baseURL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:8000";

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
          bank_name: data.bank_name || "",
          bank_account_number: data.bank_account_number || "",
          bank_account_name: data.bank_account_name || "",
        });

        if (data.qris_image) {
          setQrisPreview(`${baseURL}${data.qris_image}`);
        }
      } catch (error) {
        console.error("Gagal mengambil pengaturan", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrisImage(file);
      setQrisPreview(URL.createObjectURL(file)); // Buat preview sementara di browser
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tax_percentage: Number(formData.tax_percentage),
        qris_image: qrisImage, // Sisipkan file gambar ke payload
      };

      await updateSettings(payload);
      alert("Mantap! Pengaturan Toko berhasil diperbarui 💾");
    } catch (error) {
      alert(
        "Gagal menyimpan pengaturan. Pastikan gambar tidak lebih dari 2MB.",
      );
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
    <div className="font-sans pb-10 animate-fade-in max-w-5xl mx-auto">
      <header className="mb-8 border-b border-zinc-200 pb-5">
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Pengaturan Toko & Pembayaran
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">
          Atur identitas kedai, PPN, dan detail pembayaran digital (QRIS &
          Transfer).
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* KOTAK 1: PROFIL TOKO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-black text-zinc-800 mb-6 flex items-center gap-2">
            <Storefront className="text-orange-500" size={24} weight="fill" />{" "}
            Profil Kedai
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Nama Kedai / Toko
              </label>
              <div className="relative">
                <Storefront
                  className="absolute left-4 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="text"
                  name="store_name"
                  required
                  value={formData.store_name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-zinc-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Nomor Telepon / WA
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="text"
                  name="store_phone"
                  value={formData.store_phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Alamat Lengkap Kedai
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-4 text-zinc-400"
                  size={20}
                />
                <textarea
                  name="store_address"
                  rows={3}
                  value={formData.store_address}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800 resize-none"
                ></textarea>
              </div>
            </div>
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
        </div>

        {/* KOTAK 2: DETAIL PEMBAYARAN (QRIS & TRANSFER) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-black text-zinc-800 mb-6 flex items-center gap-2">
            <Bank className="text-blue-500" size={24} weight="fill" /> Informasi
            Pembayaran
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sisi Kiri: Rekening Transfer */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">
                Detail Rekening Transfer
              </h3>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  Nama Bank
                </label>
                <div className="relative">
                  <Bank
                    className="absolute left-4 top-3.5 text-zinc-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="bank_name"
                    placeholder="Contoh: BCA / Mandiri / BNI"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-zinc-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  Nomor Rekening
                </label>
                <div className="relative">
                  <IdentificationCard
                    className="absolute left-4 top-3.5 text-zinc-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="bank_account_number"
                    placeholder="Contoh: 1234567890"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-zinc-800 tracking-widest"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  Atas Nama (Pemilik Rekening)
                </label>
                <div className="relative">
                  <Storefront
                    className="absolute left-4 top-3.5 text-zinc-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="bank_account_name"
                    placeholder="Contoh: Kopi Kita Indonesia"
                    value={formData.bank_account_name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-zinc-800"
                  />
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Foto QRIS */}
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">
                Barcode QRIS Kedai
              </h3>
              <div className="border-2 border-dashed border-zinc-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors relative h-64 overflow-hidden">
                {qrisPreview ? (
                  <>
                    <img
                      src={qrisPreview}
                      alt="QRIS Preview"
                      className="w-full h-full object-contain"
                    />
                    <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-bold">
                      <ImageIcon size={32} className="mb-2" /> Ganti QRIS
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer text-zinc-500 w-full h-full">
                    <QrCode
                      size={48}
                      weight="duotone"
                      className="mb-3 text-zinc-400"
                    />
                    <span className="font-bold text-sm">Upload Foto QRIS</span>
                    <span className="text-xs text-zinc-400 mt-1">
                      Format: JPG, PNG (Max 2MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs font-bold text-blue-500 mt-3 text-center bg-blue-50 py-2 rounded-lg">
                Gambar ini akan otomatis muncul di Layar Kasir.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end sticky bottom-6 z-50">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-2xl text-lg"
          >
            <FloppyDisk size={24} weight="fill" />
            {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
