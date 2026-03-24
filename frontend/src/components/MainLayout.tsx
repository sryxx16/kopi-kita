import Sidebar from "./Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Tambahan print:bg-white biar kertasnya bersih
    <div className="flex min-h-screen bg-zinc-50 print:bg-white">
      {/* Panggil Sidebar */}
      <Sidebar />

      {/* Konten Utama (Margin dan padding direset pas nge-print) */}
      <div className="flex-1 ml-64 p-8 print:ml-0 print:p-0">{children}</div>
    </div>
  );
}
