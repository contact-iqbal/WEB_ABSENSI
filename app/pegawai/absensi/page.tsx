'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faCheck, faClock, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

interface Absensi {
  id: number;
  tanggal: string;
  absen_masuk: string | null;
  absen_keluar: string | null;
  status: string;
  keterangan: string | null;
}

interface Stats {
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export default function AbsensiPegawaiPage() {
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<Absensi[]>([]);
  const [stats, setStats] = useState<Stats>({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpha: 0 });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchRiwayat();
    }
  }, [userId, selectedMonth, selectedStatus, page]);

  const fetchSession = async () => {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    if (data.success) setUserId(data.userId);
  };

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const [tahun, bulan] = selectedMonth.split('-');
      
      const res = await fetch('/api/karyawan/riwayat_absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          karyawan_id: userId,
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
          status: selectedStatus,
          page,
          limit: 10
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setRiwayatAbsensi(data.result);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hadir': return 'bg-green-100 text-green-700';
      case 'terlambat': return 'bg-yellow-100 text-yellow-700';
      case 'izin': return 'bg-blue-100 text-blue-700';
      case 'sakit': return 'bg-orange-100 text-orange-700';
      case 'alpha': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time.substring(0, 5).replace(':', '.');
  };

  return (
    <div className="space-y-6">
      <div className='md:pt-12'>
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Absensi</h1>
        <p className="text-gray-600 mt-1">Lihat riwayat kehadiran Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faCheck} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Hadir</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.hadir}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center text-yellow-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Terlambat</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.terlambat}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Izin / Sakit</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.izin + stats.sakit}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center text-red-600">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Alpha</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.alpha}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 w-full"
              />
            </div>
            <select 
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option>Semua Status</option>
              <option>Hadir</option>
              <option>Terlambat</option>
              <option>Izin</option>
              <option>Sakit</option>
              <option>Alpha</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jam Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jam Keluar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center">Loading...</td></tr>
              ) : riwayatAbsensi.length > 0 ? (
                riwayatAbsensi.map((item) => (
                  <tr key={item.id + item.tanggal} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </td>
                    <td className="px-6 py-4">{formatTime(item.absen_masuk)}</td>
                    <td className="px-6 py-4">{formatTime(item.absen_keluar)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.keterangan || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Tidak ada data absensi untuk periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
