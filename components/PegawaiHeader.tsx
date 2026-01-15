'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser } from '@fortawesome/free-solid-svg-icons';

export default function PegawaiHeader() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 z-10">

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <FontAwesomeIcon icon={faBell} className="text-lg" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-sm text-white" />
          </div>
          <span className="text-sm font-medium">Nama Pegawai</span>
        </button>
      </div>
    </header>
  );
}
