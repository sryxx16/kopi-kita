import Sidebar from "./Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Panggil Sidebar */}
      <Sidebar />

      {/* Konten Utama (Bergeser ke kanan sebesar lebar sidebar yaitu 64 / 256px) */}
      <div className="flex-1 ml-64 p-8">{children}</div>
    </div>
  );
}
