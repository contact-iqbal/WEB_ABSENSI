'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faClock,
  faCircleCheck,
  faArrowRightToBracket,
  faArrowRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { showSuccess } from '@/lib/sweetalert';

export default function PegawaiDashboard() {
  const [jamMasuk, setJamMasuk] = useState<string | null>(null);
  const [jamKeluar, setJamKeluar] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAbsen = async () => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (!jamMasuk) {
      setJamMasuk(time);
      console.log(time)
      await showSuccess('Absen Masuk Berhasil!', `Tercatat pada ${time}`);
    } else if (!jamKeluar) {
      setJamKeluar(time);
      await showSuccess('Absen Keluar Berhasil!', `Tercatat pada ${time}`);
    }
  };

  const getStatusButton = () => {
    if (!jamMasuk) {
      return {
        text: 'Absen Masuk',
        icon: faArrowRightToBracket,
        disabled: false,
        bgColor: 'bg-gray-800 hover:bg-gray-900'
      };
    } else if (!jamKeluar) {
      return {
        text: 'Absen Keluar',
        icon: faArrowRightFromBracket,
        disabled: false,
        bgColor: 'bg-gray-800 hover:bg-gray-900'
      };
    } else {
      return {
        text: 'Absensi Selesai',
        icon: faCircleCheck,
        disabled: true,
        bgColor: 'bg-gray-400'
      };
    }
  };

  const buttonStatus = getStatusButton();
  const toMinutes = (time: string) => {
    const [h, m] = time.split('.').map(Number)
    return h * 60 + m
  }
  const getTimeColor = (time?: string) => {
    if (!time) return 'text-gray-300'

    return toMinutes(time) > 8 * 60
      ? 'text-red-500'
      : 'text-gray-800'
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Pegawai</h1>
        <p className="text-gray-600 mt-1">{currentDate}</p>
      </div>

      <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-4">
              <FontAwesomeIcon icon={faClock} className="text-3xl text-white" />
            </div>
            <div className="text-5xl font-bold text-gray-800 mb-2 tabular-nums">
              {currentTime}
            </div>
            <p className="text-gray-600 text-sm">Waktu Saat Ini</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Jam Masuk</span>
                <FontAwesomeIcon
                  icon={faArrowRightToBracket}
                  className={`text-lg ${jamMasuk ? 'text-gray-800' : 'text-gray-300'}`}
                />
              </div>
              <div className={`text-3xl font-bold ${getTimeColor(String(jamMasuk))}`}>
                {jamMasuk || '--:--'}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Jam Keluar</span>
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className={`text-lg ${jamKeluar ? 'text-gray-800' : 'text-gray-300'}`}
                />
              </div>
              <div className={`text-3xl font-bold ${jamKeluar ? 'text-gray-800' : 'text-gray-300'}`}>
                {jamKeluar || '--:--'}
              </div>
            </div>
          </div>

          <button
            onClick={handleAbsen}
            disabled={buttonStatus.disabled}
            className={`w-full py-4 ${buttonStatus.bgColor} text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-3`}
          >
            <FontAwesomeIcon icon={buttonStatus.icon} className="text-xl" />
            {buttonStatus.text}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Absensi Bulan Ini</p>
              <h3 className="text-3xl font-bold text-gray-800">0 Hari</h3>
            </div>
            <div className="bg-gray-100 w-14 h-14 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Keterlambatan</p>
              <h3 className="text-3xl font-bold text-gray-800">0 Kali</h3>
            </div>
            <div className="bg-gray-100 w-14 h-14 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-2xl text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Absensi Terbaru</h3>
          <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <div>
                <p className="font-medium text-gray-800">Senin, {i} Jan 2024</p>
                <p className="text-sm text-gray-500 mt-1">08:00 - 17:00</p>
              </div>
              <span className="px-4 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-lg">
                Hadir
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
