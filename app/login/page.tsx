'use client';

import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { showError, showSuccess } from '@/lib/sweetalert';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberme: false,
    debug: false
  });
  const [loading, setLoading] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();

      if (result.success) {
        if (result.accountAccess == "admin") {
          router.push('/admin');
        } else {
          router.push('/pegawai');
        }
        setAuthResult(result);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.username || !formData.password) {
      await showError('Error', 'Username dan password harus diisi!');
      setLoading(false);
      return;
    }

    // setTimeout(async () => {
    //   await showSuccess('Berhasil Login!', 'Selamat datang di Sistem Absensi');
    //   setLoading(false);
    //   router.push('/admin');
    // }, 1000);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (result.success) {
        if (result.message) {
          await showSuccess('Akun dibuat!', `${result.message}`);
          setLoading(false);
          router.refresh();
        } else {
          await showSuccess('Berhasil Login!', `Selamat datang di Sistem Absensi ${result.user.real_name}!`);
          if (result.user.type == "admin") {
            setLoading(false);
            router.push('/admin');
          } else {
            setLoading(false);
            router.push('/pegawai');
          }
        }
      } else {
        setLoading(false);
        await showError('Uh oh', `${result.error}`)
      }
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-neutral-800 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faUser} className="text-4xl text-neutral-800" />
            </div>
            <h1 className="text-2xl font-bold">Sistem Absensi</h1>
            <p className="text-gray-300 mt-2">Silakan login untuk melanjutkan</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Masukkan username"
                    className="w-full pl-12 pr-4 py-3 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="w-full pl-12 pr-4 py-3 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-neutral-800 border-gray-300 rounded focus:ring-neutral-800"
                    onChange={(e) => setFormData({ ...formData, rememberme: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Ingat Saya</span>
                </label>
                <a href="#" className="text-sm text-neutral-700 hover:text-neutral-900 font-medium">
                  Lupa Password?
                </a>
              </div>
              {/* <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-neutral-800 border-gray-300 rounded focus:ring-neutral-800"
                  onChange={(e) => setFormData({ ...formData, debug: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">DEBUG: buat akun</span>
              </label> */}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${loading
                  ? 'bg-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-800 hover:bg-neutral-900 shadow-lg hover:shadow-xl'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSignInAlt} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <a href="#" className="text-neutral-700 hover:text-neutral-900 font-medium">
                  Hubungi Administrator
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            &copy; 2024 Sistem Absensi Karyawan. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
