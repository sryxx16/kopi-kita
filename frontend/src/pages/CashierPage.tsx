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
  ArrowDown,
} from "phosphor-react";

export default function CashierPage() {
  // 🔗 FIX: Paksa nembak ke Port 8000 biar gambar & API sinkron
  const baseURL = "http://localhost:8000";

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
  const [customerName, setCustomerName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any | null>(null);

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

  // --- Logic Cart & Promo (Sama seperti sebelumnya) ---
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
    setCustomerName("");
  };

  const handleApplyPromo = () => {
    if (!promoCode) return setAppliedPromo(null);
    const foundPromo = promos.find((p) => p.code === promoCode.toUpperCase());
    if (!foundPromo) return alert("Voucher tidak valid!");
    setAppliedPromo(foundPromo);
    alert(`Voucher ${foundPromo.name} aktif!`);
  };

  // --- Perhitungan Total ---
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
  const totalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (totalAfterDiscount * (settings.tax_percentage || 0)) / 100;
  const grandTotal = totalAfterDiscount + taxAmount;

  useEffect(() => {
    if (paymentMethod !== "cash" && grandTotal > 0)
      setPayAmount(grandTotal.toString());
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
      clearCart();
    } catch (error: any) {
      alert("Gagal transaksi.");
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
      <div className="print:hidden font-sans h-[calc(100vh-80px)] flex flex-col xl:flex-row gap-6 animate-fade-in pb-8">
        {/* BAGIAN KIRI: DAFTAR MENU */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden h-full">
          <div className="p-6 border-b border-zinc-100 bg-white">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search Bar */}
              <div className="w-full md:w-80 relative">
                <MagnifyingGlass
                  className="absolute left-4 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                />
              </div>

              {/* 🔥 DROPDOWN KATEGORI 🔥 */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="text-xs font-bold text-zinc-400 uppercase hidden md:block">
                  Filter:
                </label>
                <div className="relative flex-1 md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-700 cursor-pointer transition-all"
                  >
                    <option value="all">Semua Menu</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <ArrowDown size={18} weight="bold" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Menu */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-sm hover:shadow-md hover:border-orange-400 cursor-pointer transition-all flex flex-col h-full"
                >
                  <div className="h-32 bg-zinc-100 rounded-xl mb-3 overflow-hidden relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Coffee
                        size={32}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-300"
                        weight="fill"
                      />
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-[10px] font-black text-orange-600">
                      Stok: {product.stock}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-zinc-800 text-sm line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-orange-600 font-black text-base mt-2">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: KERANJANG & BAYAR */}
        <div className="w-full xl:w-[420px] flex flex-col bg-white rounded-3xl shadow-sm border border-zinc-200 h-full overflow-hidden flex-shrink-0">
          <div className="p-5 border-b border-zinc-100 bg-zinc-900 text-white flex justify-between items-center">
            <h2 className="text-lg font-black flex items-center gap-2">
              <ShoppingCart size={24} className="text-orange-500" /> Pesanan
            </h2>
            <span className="bg-orange-600 px-3 py-1 rounded-full text-xs font-bold">
              {cart.length} Item
            </span>
          </div>

          {/* Input Nama */}
          <div className="p-4 border-b border-zinc-100 bg-white">
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-zinc-400"
                size={18}
                weight="bold"
              />
              <input
                type="text"
                placeholder="Nama Pelanggan / No. Meja"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-sm"
              />
            </div>
          </div>

          {/* List Item Cart */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50">
                <ShoppingCart size={64} className="mb-4" />
                <p className="font-bold text-center text-sm">
                  Pilih menu untuk memulai pesanan
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
                      <p className="text-orange-600 font-black text-xs">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 bg-white rounded text-zinc-600 flex items-center justify-center shadow-sm"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-black text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 bg-white rounded text-zinc-600 flex items-center justify-center shadow-sm"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash size={18} weight="fill" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Bayar */}
          <div className="bg-white p-5 border-t border-zinc-200 shadow-2xl">
            <div className="space-y-2 mb-4 text-sm font-bold">
              <div className="flex justify-between text-zinc-500">
                <p>Subtotal</p>
                <p>Rp {subtotal.toLocaleString("id-ID")}</p>
              </div>
              <div className="flex justify-between items-end mt-2 pt-2 border-t border-dashed border-zinc-300">
                <p className="font-bold text-zinc-500">TOTAL</p>
                <p className="text-2xl font-black text-orange-600">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Tombol Metode Bayar */}
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2 flex flex-col items-center gap-1 rounded-xl font-bold text-xs border-2 transition-all ${paymentMethod === "cash" ? "border-green-500 bg-green-50 text-green-700" : "border-zinc-100 text-zinc-500"}`}
                >
                  <Money size={20} /> Tunai
                </button>
                <button
                  onClick={() => setPaymentMethod("qris")}
                  className={`py-2 flex flex-col items-center gap-1 rounded-xl font-bold text-xs border-2 transition-all ${paymentMethod === "qris" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-100 text-zinc-500"}`}
                >
                  <QrCode size={20} /> QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod("transfer")}
                  className={`py-2 flex flex-col items-center gap-1 rounded-xl font-bold text-xs border-2 transition-all ${paymentMethod === "transfer" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-zinc-100 text-zinc-500"}`}
                >
                  <Bank size={20} /> Bank
                </button>
              </div>
            </div>

            {/* 🔥 INFO PEMBAYARAN DINAMIS (QRIS FIX) 🔥 */}
            <div className="mb-4">
              {paymentMethod === "cash" && (
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-black text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Jumlah Bayar"
                    className="w-full pl-12 pr-4 py-3 bg-blue-50 border border-blue-200 rounded-xl outline-none font-black text-lg text-blue-800"
                  />
                </div>
              )}
              {paymentMethod === "qris" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col items-center animate-fade-in">
                  <p className="text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-widest">
                    Scan Barcode QRIS
                  </p>
                  <img
                    src={
                      settings.qris_image
                        ? `${baseURL}${settings.qris_image}`
                        : "https://dummyimage.com/200x200/cccccc/000000&text=No+QRIS"
                    }
                    alt="QRIS"
                    className="w-32 h-32 rounded-lg border-2 border-white shadow-sm object-contain bg-white"
                  />
                  <p className="text-[10px] text-blue-400 mt-2 font-bold uppercase">
                    Sudah Bayar?
                  </p>
                </div>
              )}
              {paymentMethod === "transfer" && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl animate-fade-in">
                  <p className="text-[10px] font-bold text-purple-600 mb-1 uppercase tracking-widest">
                    Rekening Tujuan:
                  </p>
                  <p className="font-black text-purple-900 text-sm">
                    {settings.bank_name || "Bank"} -{" "}
                    {settings.bank_account_number || "0000"}
                  </p>
                  <p className="text-[10px] text-purple-500 font-bold uppercase">
                    a.n {settings.bank_account_name || "Owner"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="p-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash size={24} weight="bold" />
              </button>
              <button
                onClick={handleCheckout}
                disabled={isSubmitting || cart.length === 0}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl font-black text-lg transition-all ${cart.length === 0 ? "bg-zinc-200 text-zinc-400" : "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"}`}
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

        {/* Modal Sukses Kembalian */}
        {checkoutSuccess && (
          <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col text-center animate-fade-in">
              <div className="bg-green-500 p-8 text-white flex flex-col items-center">
                <CheckCircle
                  size={64}
                  weight="fill"
                  className="mb-4 animate-bounce"
                />
                <h2 className="text-3xl font-black">Lunas!</h2>
                <p className="text-green-100 font-bold mt-1">
                  Invoice: #{checkoutSuccess.invoice}
                </p>
              </div>
              <div className="p-8 pb-6">
                <p className="text-zinc-500 font-bold uppercase text-xs mb-1">
                  {checkoutSuccess.paymentMethod === "cash"
                    ? "Kembalian"
                    : "Nominal Bayar"}
                </p>
                <h1 className="text-5xl font-black mb-8 text-zinc-800">
                  Rp {checkoutSuccess.kembali.toLocaleString("id-ID")}
                </h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-zinc-100 text-zinc-600 font-bold p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-50 hover:text-orange-600 transition-all"
                  >
                    <Printer size={20} /> Cetak
                  </button>
                  <button
                    onClick={() => setCheckoutSuccess(null)}
                    className="flex-1 bg-zinc-900 text-white font-bold p-4 rounded-2xl shadow-lg"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🖨️ STRUK THERMAL 80MM (TENGAH) 🖨️ */}
      {checkoutSuccess && (
        <div className="hidden print:flex print:justify-center w-full">
          <div className="font-mono text-black bg-white w-full max-w-[80mm] text-[10px] p-2">
            <div className="text-center mb-4">
              <h2 className="text-xl font-black mb-1 uppercase">
                {settings.store_name || "KOPI KITA"}
              </h2>
              <p className="leading-tight">
                {settings.store_address || "Alamat Toko"}
              </p>
              {settings.store_phone && <p>Telp: {settings.store_phone}</p>}
            </div>
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between">
                <p>Inv: #{checkoutSuccess.invoice}</p>
              </div>
              <p>Tgl: {new Date().toLocaleString("id-ID")}</p>
              <p>Pelanggan: {checkoutSuccess.customerName || "Walk-in"}</p>
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
                    <p>
                      {(item.quantity * item.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>{checkoutSuccess.subtotal.toLocaleString("id-ID")}</p>
              </div>
              {checkoutSuccess.discountAmount > 0 && (
                <div className="flex justify-between">
                  <p>Diskon</p>
                  <p>
                    -{checkoutSuccess.discountAmount.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
              {checkoutSuccess.taxAmount > 0 && (
                <div className="flex justify-between">
                  <p>Pajak</p>
                  <p>{checkoutSuccess.taxAmount.toLocaleString("id-ID")}</p>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm mt-1 border-t border-black pt-1">
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
            <div className="text-center mt-6 uppercase font-bold">
              <p>*** Terima Kasih ***</p>
              <p>Selamat Menikmati!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
