'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUsers,
  faCalendarCheck,
  faMoneyBillWave,
  faChartBar,
  faCog,
  faUser,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

interface MenuItem {
  title: string;
  icon: IconDefinition;
  href: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: faChartLine, href: '/dashboard' },
  { title: 'Data Karyawan', icon: faUsers, href: '/dashboard/karyawan' },
  { title: 'Absensi', icon: faCalendarCheck, href: '/dashboard/absensi' },
  { title: 'Gaji', icon: faMoneyBillWave, href: '/dashboard/gaji' },
  { title: 'Laporan', icon: faChartBar, href: '/dashboard/laporan' },
  { title: 'Pengaturan', icon: faCog, href: '/dashboard/pengaturan' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Sistem Absensi</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
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
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-base" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Administrator</p>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
