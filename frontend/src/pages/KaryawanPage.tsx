import { useEffect, useState } from "react";
import { getEmployees, addEmployee } from "../services/employee";
import {
  UserPlus,
  IdentificationBadge,
  EnvelopeSimple,
  LockKey,
} from "phosphor-react";

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Gagal mengambil data karyawan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addEmployee({ name, email, password });
      alert("Mantap! Akun Kasir baru berhasil dibuat 🚀");

      // Reset Form
      setName("");
      setEmail("");
      setPassword("");
      setShowForm(false);
      fetchEmployees();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Gagal menambahkan kasir. Pastikan email belum terpakai.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans">
      <header className="mb-8 flex justify-between items-end border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Data Karyawan
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Kelola akses akun untuk kasir toko Anda
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-zinc-900 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
        >
          <UserPlus size={20} weight="bold" />
          {showForm ? "Batal Tambah" : "Tambah Kasir"}
        </button>
      </header>

      {/* FORM TAMBAH KARYAWAN */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold text-zinc-800 mb-6 flex items-center gap-2">
            <IdentificationBadge size={24} className="text-orange-500" /> Buat
            Akun Kasir Baru
          </h2>
          <form
            onSubmit={handleAddEmployee}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <IdentificationBadge
                  className="absolute left-3 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Siti Kasir"
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Email Login
              </label>
              <div className="relative">
                <EnvelopeSimple
                  className="absolute left-3 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siti@kopi.com"
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Password Sementara
              </label>
              <div className="relative">
                <LockKey
                  className="absolute left-3 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold p-3 rounded-xl transition-all h-[50px]"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Akun"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL DAFTAR KARYAWAN */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                Nama Karyawan
              </th>
              <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                Email Akun
              </th>
              <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                Role
              </th>
              <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                Tanggal Bergabung
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-zinc-400 font-medium animate-pulse"
                >
                  Memuat data karyawan...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-zinc-400 font-medium"
                >
                  Belum ada kasir yang terdaftar
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-bold text-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    {emp.name}
                  </td>
                  <td className="p-4 text-zinc-600 font-medium">{emp.email}</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500 text-sm">
                    {new Date(emp.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
