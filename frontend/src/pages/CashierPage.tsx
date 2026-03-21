import { useState, useEffect } from "react";
import { getProducts } from "../services/product";
import { checkout } from "../services/transaction";

export default function CashierPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 1. Ambil data produk dari backend saat halaman dibuka
  useEffect(() => {
    getProducts().then((data) => setProducts(data));
  }, []);

  // 2. Fungsi Tambah ke Keranjang
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product_id === product.id,
      );
      if (existingItem) {
        // Kalau sudah ada, tambah quantity-nya aja
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // Kalau belum ada, masukin sebagai item baru
      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  // 3. Logika Hitung Total Harga (Otomatis)
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // 4. Fungsi Bayar (Checkout)
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    if (Number(amountPaid) < totalPrice) return alert("Uang bayar kurang!");

    setLoading(true);
    try {
      const response = await checkout(cart, Number(amountPaid));
      alert(
        `Transaksi Berhasil!\nNomor Struk: ${response.invoice}\nKembalian: Rp ${response.kembalian}`,
      );

      // Reset keranjang setelah berhasil bayar
      setCart([]);
      setAmountPaid("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-100 font-sans">
      {/* BAGIAN KIRI: Daftar Menu */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <h1 className="text-3xl font-extrabold text-zinc-800 mb-6">
          Point of Sale
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-orange-500 border border-transparent transition-all"
            >
              <div className="h-24 bg-zinc-200 rounded-lg mb-3 flex items-center justify-center text-zinc-400">
                ☕
              </div>
              <h3 className="font-bold text-sm text-gray-800 line-clamp-1">
                {p.name}
              </h3>
              <p className="text-orange-600 font-bold">
                Rp {p.price.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BAGIAN KANAN: Keranjang (Cart) */}
      <div className="w-1/3 bg-white shadow-xl p-6 flex flex-col">
        <h2 className="text-xl font-bold border-b pb-4 mb-4">
          Keranjang Belanja
        </h2>

        {/* Daftar Item */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-center text-zinc-400 mt-10">Belum ada pesanan</p>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center mb-4"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    Rp {item.price.toLocaleString("id-ID")} x {item.quantity}
                  </p>
                </div>
                <div className="font-bold text-gray-800">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & Input Bayar */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-600">Total</span>
            <span className="text-2xl font-extrabold text-orange-600">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Uang Diterima (Rp)
            </label>
            <input
              type="number"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-lg"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0"
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-colors ${
              loading || cart.length === 0
                ? "bg-zinc-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Memproses..." : "Proses Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  );
}
