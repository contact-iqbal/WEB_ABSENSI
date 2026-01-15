'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faClock,
  faMoneyBillWave,
  faFileAlt,
  faArrowRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { showSuccess } from '@/lib/sweetalert';

export default function PegawaiDashboard() {
  const [jamMasuk, setJamMasuk] = useState<string | null>(null);
  const [jamKeluar, setJamKeluar] = useState<string | null>(null);

  const handleAbsenMasuk = async () => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setJamMasuk(time);
    await showSuccess('Absen Masuk Berhasil!', `Tercatat pada ${time}`);
  };

  const handleAbsenKeluar = async () => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setJamKeluar(time);
    await showSuccess('Absen Keluar Berhasil!', `Tercatat pada ${time}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Pegawai</h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-black">
          <h3 className="text-lg font-semibold mb-4">Absensi Hari Ini</h3>

          <div className="space-y-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              {jamMasuk ? (
                <p className="text-3xl font-bold">{jamMasuk}</p>
              ) : (
                <button
                  onClick={handleAbsenMasuk}
                  className="w-full py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Absen Masuk
                </button>
              )}
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              {jamKeluar ? (
                <p className="text-3xl font-bold">{jamKeluar}</p>
              ) : (
                <button
                  onClick={handleAbsenKeluar}
                  disabled={!jamMasuk}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                    jamMasuk
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Absen Keluar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Absensi Bulan Ini</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">0 Hari</h3>
              </div>
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Keterlambatan</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">0 Kali</h3>
              </div>
              <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Riwayat Absensi Terbaru</h3>
            <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Senin, {i} Jan 2024</p>
                  <p className="text-sm text-gray-600">08:00 - 17:00</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Hadir
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Gaji Bulan Ini</h3>
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gaji Pokok</span>
                <span className="font-semibold text-gray-800">Rp 5.000.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tunjangan</span>
                <span className="font-semibold text-green-600">+ Rp 1.000.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Potongan</span>
                <span className="font-semibold text-red-600">- Rp 0</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-xl text-blue-600">Rp 6.000.000</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Sisa Cuti</h3>
              <FontAwesomeIcon icon={faFileAlt} className="text-orange-600" />
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl font-bold text-orange-600">12</p>
                <p className="text-gray-600 mt-2">Hari tersisa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
