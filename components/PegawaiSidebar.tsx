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
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { redirect } from 'next/navigation';
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
export default function PegawaiSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push("/login")
    } catch (e) {
      console.log(e)
    }
  }


  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-800 text-white flex flex-col">
      <div className="p-4 border-b border-neutral-700">
        <h1 className="text-xl font-bold">Portal Pegawai</h1>
        <p className="text-xs text-blue-100 mt-1">Sistem Absensi</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
        <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-blue-500 rounded-lg transition-colors" onClick={logout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="text-base" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
