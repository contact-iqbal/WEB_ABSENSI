'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUser,
  faCalendarCheck,
  faMoneyBillWave,
  faFileAlt,
  faSignOutAlt,
  IconDefinition,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { showConfirm } from '@/lib/sweetalert';
import { useEffect, useState } from 'react';

interface MenuItem {
  title: string;
  icon: IconDefinition;
  href: string;
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: faHome, href: '/pegawai' },
  { title: 'Profil Saya', icon: faUser, href: '/pegawai/profil' },
  { title: 'Absensi', icon: faCalendarCheck, href: '/pegawai/absensi' },
  { title: 'Slip Gaji', icon: faMoneyBillWave, href: '/pegawai/gaji' },
  { title: 'Izin/Cuti', icon: faFileAlt, href: '/pegawai/izin' },
];

interface PegawaiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PegawaiSidebar({ isOpen, onClose }: PegawaiSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
        if (result.accountAccess != 'owner' && result.accountAccess != 'hrd') {
          router.push('/pegawai');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };
  let onlyforuppermanagement;
  if (authResult === null) {
    onlyforuppermanagement = menuItems
  } else {
    onlyforuppermanagement = authResult && authResult.accountAccess != 'pegawai' ? [
      { title: 'Dashboard', icon: faHome, href: '/pegawai' },
      { title: 'Profil Saya', icon: faUser, href: '/pegawai/profil' },
      { title: 'Absensi', icon: faCalendarCheck, href: '/pegawai/absensi' },
      { title: 'Slip Gaji', icon: faMoneyBillWave, href: '/pegawai/gaji' },
      { title: 'Izin/Cuti', icon: faFileAlt, href: '/pegawai/izin' },
      { title: 'To admin panel', icon: faArrowLeft, href: '/admin' }
    ] : menuItems
  }

  const logout = async () => {
    try {
      const sweetalertconfirm = (await showConfirm("Confirmation", "Apakah anda yakin ingin Logout dari akun?")).isConfirmed;
      if (sweetalertconfirm) {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push("/login")
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 bg-neutral-800 text-white flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
        <div className="p-4 border-b border-neutral-700">
          <h1 className="text-xl font-bold">Portal Pegawai</h1>
          <p className="text-xs text-neutral-400 mt-1">Sistem Absensi</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {onlyforuppermanagement.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-100 hover:bg-neutral-700 hover:text-white'
                      }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-base" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-700">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-100 hover:bg-red-600 rounded-lg transition-colors"
            onClick={logout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-base" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
