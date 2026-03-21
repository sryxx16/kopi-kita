import { useEffect, useState } from "react";
import { getProducts } from "../services/product";
import ProductCard from "../components/ProductCard";

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect akan otomatis berjalan saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Gagal mengambil menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-900">Katalog Menu</h1>
        <p className="text-zinc-500 mt-1">
          Pilih minuman dan snack untuk pelanggan
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-zinc-500 font-medium animate-pulse">
            Memuat menu kopinya...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Melakukan looping (perulangan) untuk mencetak setiap produk */}
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}
