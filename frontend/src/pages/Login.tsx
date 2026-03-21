import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPI } from "../services/auth";
import { Envelope, LockKey, Eye, EyeSlash, Coffee } from "phosphor-react";

// Kita import gambar hero yang ada di folder assets abang
import heroImage from "../assets/hero.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await loginAPI(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message || "Terjadi kesalahan pada server",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* BAGIAN KIRI: Gambar Estetik (Sembunyi kalau di HP) */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 relative items-center justify-center overflow-hidden">
        {/* Efek overlay hitam transparan biar gambar agak gelap elegan */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src={heroImage}
          alt="Kopi Kita Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Teks di atas gambar */}
        <div className="relative z-20 text-center px-12">
          <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-600/30">
            <Coffee size={36} weight="fill" className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Awali Hari Dengan <br />
            Secangkir Inspirasi
          </h1>
          <p className="text-zinc-300 text-lg">
            Sistem Point of Sale (POS) modern untuk mengelola pesanan dan
            laporan Kopi Kita.
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Header Form */}
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-xl">
              <Coffee size={24} weight="bold" className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-900">Kopi Kita</h2>
          </div>

          <h2 className="text-3xl font-extrabold text-zinc-900 mb-2">
            Selamat Datang 👋
          </h2>
          <p className="text-zinc-500 mb-8">
            Silakan masukkan kredensial Anda untuk mengakses sistem kasir.
          </p>

          {/* Pesan Error */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium animate-pulse">
              {errorMsg}
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Email Kasir / Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <Envelope size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium text-zinc-900"
                  placeholder="contoh@kopikita.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                  <LockKey size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium text-zinc-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Tombol Show/Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-orange-600 transition-colors"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed shadow-none"
                  : "bg-orange-600 hover:bg-orange-700 hover:shadow-orange-600/30"
              }`}
            >
              {isLoading ? "Memeriksa data..." : "Masuk ke Sistem"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-400 font-medium">
            <p>© 2026 Kopi Kita Point of Sale</p>
          </div>
        </div>
      </div>
    </div>
  );
}
