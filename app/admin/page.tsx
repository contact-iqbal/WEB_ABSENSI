'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCheck, faTimes, faMoneyBillWave, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import pool from '@/lib/db';
import { useEffect, useState } from 'react';

interface DataResult {
  karyawan: number;
}
export default function DashboardPage() {
  const [Data, SetData] = useState<DataResult | null>(null);
  const fetchdata = async () => {
    try {
      const rows = await fetch('/api/admin/data_summary')
      const result = await rows.json();
      SetData(result.result[0]);
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    fetchdata()
  }, [])
  const stats: Array<{
    title: string;
    value: string;
    icon: IconDefinition;
    bgColor: string;
    change: string;
  }> = [
      {
        title: 'Total Karyawan',
        value: String(Data?.karyawan ?? 0),
        icon: faUsers,
        bgColor: 'bg-neutral-500',
        change: '+0%',
      },
      {
        title: 'Hadir Hari Ini',
        value: '0',
        icon: faCheck,
        bgColor: 'bg-green-600',
        change: '0%',
      },
      {
        title: 'Tidak Hadir',
        value: '0',
        icon: faTimes,
        bgColor: 'bg-red-600',
        change: '0%',
      },
      {
        title: 'Total Gaji Bulan Ini',
        value: 'Rp 0',
        icon: faMoneyBillWave,
        bgColor: 'bg-orange-400',
        change: '+0%',
      },
    ];



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di Sistem Absensi Karyawan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {stat.value}
                </h3>
                <p className="text-xs text-green-900 mt-2">{stat.change} dari bulan lalu</p>
              </div>
              <div
                className={`${stat.bgColor} w-14 h-14 rounded-full flex items-center justify-center text-white`}
              >
                <FontAwesomeIcon icon={stat.icon} className="text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Absensi Terbaru
          </h3>
          <div className="text-center py-8 text-gray-500">
            Belum ada data absensi
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Aktivitas Terkini
          </h3>
          <div className="text-center py-8 text-gray-500">
            Belum ada aktivitas
          </div>
        </div>
        <div className="bg-white col-span-2 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Convert Spreadshseet to database
          </h3>
          <div className="text-center py-8 text-gray-500">
            Coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
