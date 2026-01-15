import PegawaiSidebar from '@/components/PegawaiSidebar';
import PegawaiHeader from '@/components/PegawaiHeader';

export default function PegawaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PegawaiSidebar />
      <PegawaiHeader />
      <main className="ml-64 pt-16 p-6">
        {children}
      </main>
    </div>
  );
}
