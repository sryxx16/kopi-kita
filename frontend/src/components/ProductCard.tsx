interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string | null;
    category: { name: string };
  };
}

export default function ProductCard({ product }: ProductProps) {
  // Fungsi untuk mengubah angka 18000 jadi Rp 18.000
  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 flex flex-col items-center relative overflow-hidden">
      {/* Label Kategori */}
      <span className="absolute top-3 left-3 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md uppercase tracking-wider">
        {product.category.name}
      </span>

      {/* Kotak Gambar Placeholder (Karena kita belum upload gambar) */}
      <div className="h-32 w-full bg-zinc-100 rounded-xl mb-4 mt-6 flex items-center justify-center">
        <span className="text-zinc-400 text-sm">☕ {product.name}</span>
      </div>

      <h3 className="font-bold text-gray-800 text-center mb-1">
        {product.name}
      </h3>
      <p className="text-orange-600 font-extrabold mb-4">
        {formatRupiah(product.price)}
      </p>

      <button className="mt-auto w-full bg-zinc-900 text-white font-semibold py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
        Tambah
      </button>
    </div>
  );
}
