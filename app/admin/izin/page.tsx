'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faClock, 
  faCheckCircle, 
  faTimesCircle, 
  faInfoCircle,
  faSearch,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { showError, showSuccess, showConfirm, showImage } from '@/lib/sweetalert';

interface Izin {
  id: number;
  karyawan_id: number;
  nama: string;
  jabatan: string;
  jenis_izin: 'izin' | 'sakit' | 'cuti';
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan: string;
  bukti: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  approved_by_name: string;
  created_at: string;
}

interface Stats {
  pending: number;
  disetujui: number;
  ditolak: number;
}

export default function IzinAdminPage() {
  const [izinList, setIzinList] = useState<Izin[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, disetujui: 0, ditolak: 0 });
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<number | null>(null);

  useEffect(() => {
    fetchSession();
    fetchIzin();
  }, [filterStatus, searchTerm]);

  const fetchSession = async () => {
    const res = await fetch('/api/auth/session');
    const data = await res.json();
    if (data.success) setAdminId(data.userId);
  };

  const fetchIzin = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'Semua Status') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/izin?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setIzinList(data.result);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching izin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'disetujui' | 'ditolak') => {
    const actionText = status === 'disetujui' ? 'menyetujui' : 'menolak';
    const confirm = await showConfirm(
      'Konfirmasi',
      `Apakah Anda yakin ingin ${actionText} permohonan izin ini?`
    );

    if (confirm.isConfirmed) {
      try {
        const res = await fetch('/api/admin/izin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status, admin_id: adminId })
        });
        const data = await res.json();
        if (data.success) {
          showSuccess('Berhasil', data.message);
          fetchIzin();
        } else {
          showError('Gagal', data.message);
        }
      } catch (error) {
        showError('Error', 'Terjadi kesalahan sistem');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'disetujui':
        return 'bg-green-100 text-green-700';
      case 'ditolak':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Izin & Cuti</h1>
        <p className="text-gray-600 mt-1">Kelola permohonan izin, sakit, dan cuti karyawan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Menunggu Persetujuan</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.pending}</h3>
            </div>
            <FontAwesomeIcon icon={faClock} className="text-2xl text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Disetujui</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.disetujui}</h3>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Ditolak</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.ditolak}</h3>
            </div>
            <FontAwesomeIcon icon={faTimesCircle} className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama karyawan..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>Semua Status</option>
              <option value="pending">Pending</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Karyawan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {izinList.length > 0 ? (
                izinList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{item.nama}</div>
                      <div className="text-xs text-gray-500">{item.jabatan}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-gray-700">{item.jenis_izin}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">
                        {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">
                        s/d {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs" title={item.keterangan}>
                        {item.keterangan || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'disetujui')}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                              title="Setujui"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'ditolak')}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                              title="Tolak"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            {item.status === 'disetujui' ? 'Disetujui' : 'Ditolak'} oleh {item.approved_by_name || 'Admin'}
                          </div>
                        )}
                        {item.bukti && (
                          <button
                            onClick={() => showImage(`Bukti ${item.jenis_izin} - ${item.nama}`, item.bukti)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Lihat Bukti"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Tidak ada data permohonan izin
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
