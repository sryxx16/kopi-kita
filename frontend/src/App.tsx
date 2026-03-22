import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Halaman Kelola Menu
import CashierPage from "./pages/CashierPage";
import ReportPage from "./pages/ReportPage";
import MainLayout from "./components/MainLayout";
import KaryawanPage from "./pages/KaryawanPage";

// Komponen Sementara untuk halaman yang belum dibuat
const DummyPage = ({ title }: { title: string }) => (
  <div className="p-10 text-zinc-400 font-bold italic text-2xl">
    Halaman {title} Sedang Dalam Pembangunan... 🚧
  </div>
);

// KOMPONEN PENJAGA PINTU (GUARD)
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Kalau belum login, lempar ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kalau bukan admin, tendang ke halaman kasir!
  if (user.role !== "admin") {
    return <Navigate to="/kasir" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Halaman utama otomatis arahkan ke login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* =========================================
            RUTE KHUSUS ADMIN (Full Protected)
        ============================================= */}

        {/* 1. Dashboard Statistik (Utama) */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <MainLayout>
                <DummyPage title="Dashboard Statistik" />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* 2. Kelola Menu (Halaman Dashboard Lama) */}
        <Route
          path="/kelola-menu"
          element={
            <AdminRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* 3. Inventaris & Bahan Baku */}
        <Route
          path="/inventaris"
          element={
            <AdminRoute>
              <MainLayout>
                <DummyPage title="Inventaris & Bahan Baku" />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* 4. Manajemen Promo */}
        <Route
          path="/promo"
          element={
            <AdminRoute>
              <MainLayout>
                <DummyPage title="Manajemen Promo" />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* 5. Laporan Keuangan */}
        <Route
          path="/laporan"
          element={
            <AdminRoute>
              <MainLayout>
                <ReportPage />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* 6. Data Karyawan */}
        <Route
          path="/karyawan"
          element={
            <AdminRoute>
              <MainLayout>
                <KaryawanPage />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* 7. Pengaturan Toko */}
        <Route
          path="/pengaturan"
          element={
            <AdminRoute>
              <MainLayout>
                <DummyPage title="Pengaturan Toko" />
              </MainLayout>
            </AdminRoute>
          }
        />

        {/* =========================================
            RUTE KASIR (Semua Role Bisa Akses)
        ============================================= */}
        <Route
          path="/kasir"
          element={
            <MainLayout>
              <CashierPage />
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
