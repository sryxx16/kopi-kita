import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CashierPage from "./pages/CashierPage";
import ReportPage from "./pages/ReportPage";
import MainLayout from "./components/MainLayout";
import KaryawanPage from "./pages/KaryawanPage";

// KOMPONEN PENJAGA PINTU (GUARD)
const AdminRoute = ({ children }: { children: TSX.Element }) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Kalau bukan admin, tendang ke halaman kasir!
  if (!user || user.role !== "admin") {
    return <Navigate to="/kasir" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Halaman utama otomatis arahkan berdasarkan role */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* RUTE ADMIN (Dilindungi AdminRoute) */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </AdminRoute>
          }
        />
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

        {/* Nanti kita buat file KaryawanPage.tsx nya */}
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

        {/* RUTE KASIR (Semua Boleh Akses) */}
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
