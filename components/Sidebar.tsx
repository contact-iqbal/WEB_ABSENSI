'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUsers,
  faCalendarCheck,
  faMoneyBillWave,
  faChartBar,
  faCog,
  faUser,
  IconDefinition,
  faSignOutAlt,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
interface MenuItem {
  title: string;
  icon: IconDefinition;
  href: string;
  badge?: string;
}
import { showConfirm } from '@/lib/sweetalert';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: AdminSidebarProps) {
  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: faChartLine, href: '/admin' },
    { title: 'Data Karyawan', icon: faUsers, href: '/admin/karyawan' },
    { title: 'Akun Karyawan', icon: faUser, href: '/admin/akun' },
    { title: 'Absensi', icon: faCalendarCheck, href: '/admin/absensi' },
    { title: 'Gaji', icon: faMoneyBillWave, href: '/admin/gaji' },
    { title: 'Izin', icon: faEnvelope, href: '/admin/izin' },
    { title: 'Laporan', icon: faChartBar, href: '/admin/laporan' },
    { title: 'Pengaturan', icon: faCog, href: '/admin/pengaturan' },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    try {
      const sweetalertconfirm = (await showConfirm("Confimation", "Apakah anda yakin ingin Logout dari akun?")).isConfirmed;
      if (sweetalertconfirm) {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push("/login")
      }
    } catch (e) {
      console.log(e)
    }
  }
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
  let filteredforhrd;
  if (authResult === null) {
    filteredforhrd = [{ title: 'Dashboard', icon: faChartLine, href: '/admin' },]
  } else {
    filteredforhrd = authResult && authResult.accountAccess === 'hrd' ? menuItems.filter(item => ['Dashboard', 'Absensi', 'Izin'].includes(item.title)) : menuItems
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
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Sistem Absensi</h1>
          <p className="text-xs text-gray-400 mt-1">Selamat datang {authResult && authResult.username}, di Admin Panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredforhrd.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-neutral-700 text-white'
                      : 'text-gray-300 hover:bg-neutral-700'
                      }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-base" />
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {authResult != null &&
                (authResult.profile_pic ? <img src={authResult && (authResult.profile_pic)} alt="profile picture" /> : <FontAwesomeIcon icon={faUser} className="text-base" />)
              }
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{authResult && (authResult.username)}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            <button onClick={logout} className='cursor-pointer'>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
