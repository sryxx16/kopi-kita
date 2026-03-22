import { useEffect, useState } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employee";
import {
  UserPlus,
  IdentificationBadge,
  EnvelopeSimple,
  LockKey,
  ShieldCheck,
  Pencil,
  Trash,
  X,
} from "phosphor-react";

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null); // Kalau null berarti mode Tambah
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("kasir"); // Default role kasir
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

  // FUNGSI BATAL FORM
  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("kasir");
  };

  // FUNGSI KLIK EDIT
  const handleEditClick = (emp: any) => {
    setEditId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setPassword(""); // Password dikosongkan biar aman
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FUNGSI SUBMIT (TAMBAH / EDIT)
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { name, email, role, password };

      if (editId) {
        // Mode Edit: Kalau password kosong, jangan dikirim ke backend
        if (!password) delete payload.password;
        await updateEmployee(editId, payload);
        alert("Data Karyawan berhasil diupdate! ✏️");
      } else {
        // Mode Tambah
        await addEmployee(payload);
        alert("Mantap! Akun baru berhasil dibuat 🚀");
      }

      handleCancelForm();
      fetchEmployees();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Gagal menyimpan data. Pastikan email belum terpakai.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI HAPUS KARYAWAN
  const handleDelete = async (id: number, empName: string) => {
    const isConfirm = window.confirm(
      `🚨 PERINGATAN!\nApakah Anda yakin ingin menghapus akun milik "${empName}" secara permanen?`,
    );
    if (isConfirm) {
      try {
        await deleteEmployee(id);
        alert("Akun berhasil dihapus.");
        fetchEmployees();
      } catch (error: any) {
        alert(error.response?.data?.message || "Gagal menghapus akun.");
      }
    }
  };

  return (
    <div className="font-sans pb-10">
      <header className="mb-8 flex justify-between items-end border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Data Karyawan
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Kelola akses, edit jabatan, dan reset sandi karyawan Anda
          </p>
        </div>
        <button
          onClick={() => {
            showForm && !editId
              ? handleCancelForm()
              : (handleCancelForm(), setShowForm(true));
          }}
          className={`${showForm && !editId ? "bg-red-500 hover:bg-red-600" : "bg-zinc-900 hover:bg-orange-600"} text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg`}
        >
          {showForm && !editId ? (
            <X size={20} weight="bold" />
          ) : (
            <UserPlus size={20} weight="bold" />
          )}
          {showForm && !editId ? "Batal Tambah" : "Karyawan Baru"}
        </button>
      </header>

      {/* FORM TAMBAH / EDIT KARYAWAN */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <h2 className="text-xl font-extrabold text-zinc-800 flex items-center gap-2">
              <IdentificationBadge
                size={24}
                className={editId ? "text-blue-500" : "text-orange-500"}
              />
              {editId ? "Edit Detail Karyawan" : "Buat Akun Karyawan Baru"}
            </h2>
            {editId && (
              <button
                onClick={handleCancelForm}
                className="text-zinc-400 hover:text-red-500 font-bold bg-zinc-100 px-3 py-1 rounded-lg text-sm"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSaveEmployee}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
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
                  placeholder="Siti Kasir"
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800"
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
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800"
                />
              </div>
            </div>

            {/* DROP DOWN ROLE BARU */}
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Jabatan (Role)
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-3 top-3.5 text-zinc-400"
                  size={20}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800 cursor-pointer"
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                {editId ? "Reset Password" : "Password Baru"}
              </label>
              <div className="relative">
                <LockKey
                  className="absolute left-3 top-3.5 text-zinc-400"
                  size={20}
                />
                <input
                  type="password"
                  required={!editId}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    editId
                      ? "(Kosongkan jika tdk diubah)"
                      : "Minimal 6 karakter"
                  }
                  className="w-full pl-10 pr-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-zinc-800 text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-bold p-3 rounded-xl transition-all h-[50px] shadow-lg ${editId ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30" : "bg-orange-600 hover:bg-orange-700 shadow-orange-600/30"}`}
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : editId
                    ? "Simpan Perubahan"
                    : "Simpan Akun"}
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
              <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider text-center">
                Role
              </th>
              <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider">
                Tgl Bergabung
              </th>
              <th className="p-4 font-bold text-zinc-500 text-sm uppercase tracking-wider text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-zinc-400 font-medium animate-pulse"
                >
                  Memuat data karyawan...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-zinc-400 font-medium"
                >
                  Belum ada karyawan yang terdaftar
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-bold text-zinc-800 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${emp.role === "admin" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}
                    >
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    {emp.name}
                  </td>
                  <td className="p-4 text-zinc-600 font-medium">{emp.email}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${emp.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500 text-sm">
                    {new Date(emp.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Tombol Edit */}
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors"
                      >
                        <Pencil size={18} weight="bold" />
                      </button>
                      {/* Tombol Hapus */}
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-bold transition-colors"
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
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
