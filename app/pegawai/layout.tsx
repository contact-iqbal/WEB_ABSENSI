'use client';

import PegawaiSidebar from '@/components/PegawaiSidebar';
import PegawaiHeader from '@/components/PegawaiHeader';
import { useState } from 'react';

export default function PegawaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <PegawaiSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <PegawaiHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <main className="lg:ml-64 pt-16 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
