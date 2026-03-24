import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/product";
import { checkout } from "../services/transaction";
import { getSettings } from "../services/setting";
import { getPromos } from "../services/promo";
import {
  MagnifyingGlass,
  ShoppingCart,
  Trash,
  Minus,
  Plus,
  Ticket,
  Receipt,
  Coffee,
  WarningCircle,
  CheckCircle,
  Money,
  QrCode,
  Bank,
  Printer,
  User,
} from "phosphor-react";

export default function CashierPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ tax_percentage: 0 });
  const [promos, setPromos] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "qris" | "transfer"
  >("cash");

  // 👇 STATE BARU: Nama Pelanggan
  const [customerName, setCustomerName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);
  const baseURL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:8000";

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [prodData, catData, setSettingsData, promoData] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getSettings(),
            getPromos(),
          ]);
        setProducts(
          prodData.filter((p: any) => p.status === "tersedia" && p.stock > 0),
        );
        setCategories(catData);
        setSettings(setSettingsData);
        setPromos(
          promoData.filter(
            (p: any) => p.is_active === 1 || p.is_active === true,
          ),
        );
      } catch (error) {
        console.error("Gagal memuat data kasir:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Stok sisa ${product.stock}!`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty > item.stock) {
            alert(`Stok sisa ${item.stock}!`);
            return item;
          }
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const clearCart = () => {
    setCart([]);
    setPromoCode("");
    setAppliedPromo(null);
    setPayAmount("");
    setPaymentMethod("cash");
    setCustomerName(""); // Reset Nama Pelanggan
  };

  const handleApplyPromo = () => {
    if (!promoCode) return setAppliedPromo(null);
    const foundPromo = promos.find((p) => p.code === promoCode.toUpperCase());
    if (!foundPromo) return alert("Kode Voucher tidak valid atau tidak aktif!");
    if (foundPromo.valid_until && new Date(foundPromo.valid_until) < new Date())
      return alert("Voucher Kadaluarsa!");
    setAppliedPromo(foundPromo);
    alert(`Voucher ${foundPromo.name} berhasil digunakan! 🎉`);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  let discountAmount = 0;
  if (appliedPromo) {
    discountAmount =
      appliedPromo.discount_type === "percentage"
        ? (subtotal * appliedPromo.discount_value) / 100
        : Number(appliedPromo.discount_value);
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const totalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (totalAfterDiscount * (settings.tax_percentage || 0)) / 100;
  const grandTotal = totalAfterDiscount + taxAmount;
  const kembali = Number(payAmount) - grandTotal;

  useEffect(() => {
    if (paymentMethod !== "cash" && grandTotal > 0)
      setPayAmount(grandTotal.toString());
    else if (paymentMethod === "cash" && payAmount === grandTotal.toString())
      setPayAmount("");
  }, [paymentMethod, grandTotal]);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (Number(payAmount) < grandTotal) return alert("Uang kurang!");
    setIsSubmitting(true);
    try {
      const checkoutItems = cart.map((item) => ({
        product_id: Number(item.id),
        quantity: Math.floor(Number(item.quantity)),
      }));

      // Kirim customerName ke backend
      const res = await checkout(
        checkoutItems,
        Number(payAmount),
        grandTotal,
        paymentMethod,
        discountAmount,
        customerName,
      );

      setCheckoutSuccess({
        invoice: res.invoice,
        subtotal,
        discountAmount,
        taxAmount,
        grandTotal,
        payAmount: Number(payAmount),
        kembali: res.kembalian,
        paymentMethod,
        customerName,
        items: cart,
      });

      setProducts(
        products
          .map((p) => {
            const inCart = cart.find((c) => c.id === p.id);
            return inCart ? { ...p, stock: p.stock - inCart.quantity } : p;
          })
          .filter((p) => p.stock > 0),
      );
      clearCart();
    } catch (error: any) {
      alert(error.message || "Gagal transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategory === "all" ||
      p.category_id.toString() === selectedCategory;
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* 🚀 LAYAR KASIR (Akan disembunyikan otomatis jika tombol "Cetak Struk" ditekan) 🚀 */}
      <div className="print:hidden font-sans h-[calc(100vh-80px)] flex flex-col xl:flex-row gap-6 animate-fade-in pb-8">
        {/* BAGIAN KIRI: DAFTAR MENU */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden h-full">
          <div className="p-6 border-b border-zinc-100 bg-white z-10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:w-96 relative">
                <MagnifyingGlass
                  className="absolute left-4 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari menu kopi atau cemilan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-700"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === "all" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                >
                  Semua Menu
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id.toString())}
                    className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === c.id.toString() ? "bg-orange-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <Coffee
                  size={48}
                  className="animate-bounce mb-4 text-orange-400"
                  weight="fill"
                />
                <p className="font-bold">Menyeduh Data Menu...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <WarningCircle size={48} className="mb-4 text-zinc-300" />
                <p className="font-bold">
                  Menu tidak ditemukan atau stok habis.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-sm hover:shadow-md hover:border-orange-400 cursor-pointer transition-all group flex flex-col h-full"
                  >
                    <div className="h-32 bg-zinc-100 rounded-xl mb-3 overflow-hidden relative">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <Coffee
                          size={32}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-300"
                          weight="fill"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black text-orange-600 shadow-sm">
                        Stok: {product.stock}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="font-black text-zinc-800 leading-tight mb-1 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-orange-600 font-black text-base mt-2">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BAGIAN KANAN: KERANJANG BELANJA */}
        <div className="w-full xl:w-[420px] flex flex-col bg-white rounded-3xl shadow-sm border border-zinc-200 h-full overflow-hidden flex-shrink-0">
          <div className="p-5 border-b border-zinc-100 bg-zinc-900 text-white flex justify-between items-center">
            <h2 className="text-lg font-black flex items-center gap-2">
              <ShoppingCart size={24} className="text-orange-500" /> Pesanan
              Pelanggan
            </h2>
            <span className="bg-orange-600 px-3 py-1 rounded-full text-xs font-bold">
              {cart.length} Item
            </span>
          </div>

          {/* INPUT NAMA PELANGGAN / MEJA */}
          <div className="p-4 border-b border-zinc-100 bg-white">
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-zinc-400"
                size={18}
                weight="bold"
              />
              <input
                type="text"
                placeholder="Nama Pelanggan / No. Meja (Opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-sm text-zinc-700 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50">
                <ShoppingCart size={64} weight="duotone" className="mb-4" />
                <p className="font-bold text-center px-8">
                  Belum ada pesanan.
                  <br />
                  Pilih menu di sebelah kiri.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-xl border border-zinc-200 flex items-center gap-3 shadow-sm"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-zinc-800 text-sm line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-orange-600 font-black text-xs mt-0.5">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 bg-white rounded text-zinc-600 shadow-sm flex items-center justify-center font-bold hover:text-orange-600"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-black text-sm text-zinc-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 bg-white rounded text-zinc-600 shadow-sm flex items-center justify-center font-bold hover:text-orange-600"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash size={18} weight="fill" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 border-t border-zinc-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Ticket
                  className="absolute left-3 top-2.5 text-zinc-400"
                  size={18}
                />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Kode Voucher"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm tracking-widest uppercase"
                />
              </div>
              <button
                onClick={handleApplyPromo}
                className="bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                Klaim
              </button>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-zinc-500 font-bold">
                <p>Subtotal</p>
                <p>Rp {subtotal.toLocaleString("id-ID")}</p>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600 font-bold">
                  <p>Diskon ({appliedPromo.code})</p>
                  <p>- Rp {discountAmount.toLocaleString("id-ID")}</p>
                </div>
              )}
              {settings.tax_percentage > 0 && (
                <div className="flex justify-between text-zinc-500 font-bold">
                  <p>Pajak PPN ({settings.tax_percentage}%)</p>
                  <p>Rp {taxAmount.toLocaleString("id-ID")}</p>
                </div>
              )}
              <div className="flex justify-between items-end mt-2 pt-2 border-t border-dashed border-zinc-300">
                <p className="font-bold text-zinc-500">TOTAL BAYAR</p>
                <p className="text-2xl font-black text-orange-600 leading-none">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2 px-3 flex flex-col items-center justify-center gap-1 rounded-xl font-bold text-xs border-2 transition-all ${paymentMethod === "cash" ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"}`}
                >
                  <Money
                    size={20}
                    weight={paymentMethod === "cash" ? "fill" : "regular"}
                  />{" "}
                  Tunai
                </button>
                <button
                  onClick={() => setPaymentMethod("qris")}
                  className={`py-2 px-3 flex flex-col items-center justify-center gap-1 rounded-xl font-bold text-xs border-2 transition-all ${paymentMethod === "qris" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"}`}
                >
                  <QrCode
                    size={20}
                    weight={paymentMethod === "qris" ? "fill" : "regular"}
                  />{" "}
                  QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod("transfer")}
                  className={`py-2 px-3 flex flex-col items-center justify-center gap-1 rounded-xl font-bold text-xs border-2 transition-all ${paymentMethod === "transfer" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"}`}
                >
                  <Bank
                    size={20}
                    weight={paymentMethod === "transfer" ? "fill" : "regular"}
                  />{" "}
                  Transfer
                </button>
              </div>
            </div>

            {/* INFO PEMBAYARAN OTOMATIS */}
            <div className="mt-4 animate-fade-in">
              {paymentMethod === "qris" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col items-center">
                  <p className="text-xs font-bold text-blue-600 mb-2 uppercase">
                    Scan QRIS di Bawah Ini
                  </p>
                  {/* Jika ada gambar di settings, tampilkan. Jika tidak, pakai placeholder */}
                  <img
                    src={
                      settings.qris_image ||
                      "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                    }
                    alt="QRIS"
                    className="w-32 h-32 rounded-lg border-2 border-white shadow-sm"
                  />
                  <p className="text-[10px] text-blue-400 mt-2 text-center">
                    Pastikan status pembayaran BERHASIL di HP pelanggan
                  </p>
                </div>
              )}

              {paymentMethod === "transfer" && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                  <p className="text-xs font-bold text-purple-600 mb-2 uppercase">
                    Rekening Tujuan
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg text-white flex items-center justify-center font-black">
                      {settings.bank_name?.substring(0, 3) || "BANK"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-purple-900">
                        {settings.bank_account_number || "Belum Atur Rekening"}
                      </p>
                      <p className="text-xs font-bold text-purple-500">
                        a.n {settings.bank_account_name || "Pemilik Kedai"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                {paymentMethod === "cash"
                  ? "Uang Tunai Pelanggan"
                  : "Nominal Pembayaran"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 font-black text-zinc-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  disabled={paymentMethod !== "cash"}
                  placeholder="0"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl outline-none font-black text-lg ${paymentMethod === "cash" ? "bg-blue-50 border-blue-200 focus:ring-2 focus:ring-blue-500 text-blue-800" : "bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed"}`}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="p-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-colors"
                title="Batalkan Pesanan"
              >
                <Trash size={24} weight="bold" />
              </button>
              <button
                onClick={handleCheckout}
                disabled={isSubmitting || cart.length === 0}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-black text-lg transition-all shadow-lg ${cart.length === 0 ? "bg-zinc-200 text-zinc-400 shadow-none" : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30"}`}
              >
                {isSubmitting ? (
                  "Memproses..."
                ) : (
                  <>
                    <Receipt size={24} weight="bold" /> PROSES BAYAR
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MODAL: STRUK KEMBALIAN */}
        {checkoutSuccess && (
          <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col text-center">
              <div className="bg-green-500 p-8 text-white flex flex-col items-center relative">
                <CheckCircle
                  size={64}
                  weight="fill"
                  className="mb-4 animate-bounce"
                />
                <h2 className="text-3xl font-black tracking-tight">Lunas!</h2>
                <p className="text-green-100 font-bold mt-1">
                  Transaksi #{checkoutSuccess.invoice}
                </p>
                {checkoutSuccess.customerName && (
                  <div className="mt-4 bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold border border-white/30 backdrop-blur-sm">
                    Pelanggan: {checkoutSuccess.customerName}
                  </div>
                )}
              </div>

              <div className="p-8 pb-6">
                <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-1">
                  {checkoutSuccess.paymentMethod === "cash"
                    ? "Uang Kembalian"
                    : "Pembayaran via " +
                      checkoutSuccess.paymentMethod.toUpperCase()}
                </p>
                <h1
                  className={`text-5xl font-black tracking-tighter mb-8 ${checkoutSuccess.kembali > 0 ? "text-blue-600" : "text-zinc-800"}`}
                >
                  Rp {checkoutSuccess.kembali.toLocaleString("id-ID")}
                </h1>

                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-zinc-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent text-zinc-600 font-bold p-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={20} weight="bold" /> Cetak
                  </button>
                  <button
                    onClick={() => setCheckoutSuccess(null)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold p-4 rounded-2xl transition-all shadow-lg"
                  >
                    Pesanan Baru
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🖨️ BAGIAN KHUSUS PRINT THERMAL (Tersembunyi di layar, Muncul di Kertas Print) 🖨️ */}
      {checkoutSuccess && (
        <div className="hidden print:block font-mono text-black bg-white w-full max-w-[80mm] mx-auto text-xs p-2">
          <div className="text-center mb-4">
            <h2 className="text-xl font-black mb-1 uppercase">
              {settings.store_name || "KOPI KITA"}
            </h2>
            <p>{settings.store_address || "Alamat Toko Belum Diatur"}</p>
            {settings.store_phone && <p>Telp: {settings.store_phone}</p>}
          </div>

          <div className="border-b border-dashed border-black pb-2 mb-2">
            <p>Inv : #{checkoutSuccess.invoice}</p>
            <p>Tgl : {new Date().toLocaleString("id-ID")}</p>
            <p>Nama : {checkoutSuccess.customerName || "Walk-in Customer"}</p>
            <p>Kasir: Sistem</p>
          </div>

          <div className="border-b border-dashed border-black pb-2 mb-2">
            {checkoutSuccess.items.map((item: any, idx: number) => (
              <div key={idx} className="mb-1">
                <p>{item.name}</p>
                <div className="flex justify-between">
                  <p>
                    {item.quantity} x{" "}
                    {Number(item.price).toLocaleString("id-ID")}
                  </p>
                  <p>{(item.quantity * item.price).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-black pb-2 mb-2">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p>{checkoutSuccess.subtotal.toLocaleString("id-ID")}</p>
            </div>
            {checkoutSuccess.discountAmount > 0 && (
              <div className="flex justify-between">
                <p>Diskon</p>
                <p>-{checkoutSuccess.discountAmount.toLocaleString("id-ID")}</p>
              </div>
            )}
            {checkoutSuccess.taxAmount > 0 && (
              <div className="flex justify-between">
                <p>PPN</p>
                <p>{checkoutSuccess.taxAmount.toLocaleString("id-ID")}</p>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm mt-1">
              <p>TOTAL</p>
              <p>{checkoutSuccess.grandTotal.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <p>Bayar ({checkoutSuccess.paymentMethod.toUpperCase()})</p>
              <p>{checkoutSuccess.payAmount.toLocaleString("id-ID")}</p>
            </div>
            <div className="flex justify-between">
              <p>Kembali</p>
              <p>{checkoutSuccess.kembali.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="text-center mt-4">
            <p>*** TERIMA KASIH ***</p>
            <p>Silakan datang kembali</p>
          </div>
        </div>
      )}
    </>
  );
}
