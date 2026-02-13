'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import 'animate.css'
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)}/>
      <main className="lg:ml-64 pt-16 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
