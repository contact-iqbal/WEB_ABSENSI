'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PegawaiHeaderProps {
  onMenuClick: () => void;
}

export default function PegawaiHeader({ onMenuClick }: PegawaiHeaderProps) {
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
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const routepush = (value: string) => {
    router.push(value)
  }

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        <FontAwesomeIcon icon={faBars} className="text-xl" />
      </button>

      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <FontAwesomeIcon icon={faBell} className="text-lg" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          onClick={() => routepush("/pegawai/profil")}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden">
            {authResult != null &&
              (authResult.profile_pic ? <img src={authResult && (authResult.profile_pic)} alt="profile picture" className='h-full w-full object-cover'/> : <FontAwesomeIcon icon={faUser} className="text-base" />)
            }
          </div>
          <span className="hidden sm:block text-sm font-medium">{authResult && (authResult.username)}</span>
        </button>
      </div>
    </header>
  );
}
