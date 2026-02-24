'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fileURLToPath } from 'url';

interface MenuItem {
  title: string;
  href: string;
  badge?: string;
}
interface Adminheaderprop {
  onMenuClick: () => void;
}

export default function Header({onMenuClick}: Adminheaderprop) {
  const pathname = usePathname();
  const [authResult, setAuthResult] = useState<any>(null);
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();

      if (result.success) {
        setAuthResult(result);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Data Karyawan', href: '/admin/karyawan' },
    { title: 'Absensi', href: '/admin/absensi' },
    { title: 'Gaji', href: '/admin/gaji' },
    { title: 'Laporan', href: '/admin/laporan' },
    { title: 'Pengaturan', href: '/admin/pengaturan' },
  ];


  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        <FontAwesomeIcon icon={faBars} className="text-xl" />
      </button>
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800"></h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg" onClick={() => (console.log('checking notification?'))}>
          <FontAwesomeIcon icon={faBell} className="text-lg" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>


        {/* <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <FontAwesomeIcon icon={faUser} className="text-base" />
          <span className="text-sm font-medium">{authResult && (authResult.username)}</span>
        </button> */}
      </div>
    </header>
  );
}
