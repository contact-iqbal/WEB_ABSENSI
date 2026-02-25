'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faDownload, faEye, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

interface Gaji {
  id: number;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  total_tunjangan: number;
  total_potongan: number;
  gaji_bersih: number;
  status_bayar: string;
  tanggal_bayar: string;
  detail_tunjangan: string;
  detail_potongan: string;
}

export default function GajiPegawaiPage() {
  const [gajiHistory, setGajiHistory] = useState<Gaji[]>([]);
  const [currentGaji, setCurrentGaji] = useState<Gaji | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaji = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        if (session.success) {
          const res = await fetch(`/api/karyawan/gaji?karyawan_id=${session.userId}`);
          const data = await res.json();
          if (data.success) {
            setGajiHistory(data.result.history);
            setCurrentGaji(data.result.current);
          }
        }
      } catch (error) {
        console.error('Error fetching salary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGaji();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBulanName = (bulan: number) => {
    const names = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return names[bulan - 1];
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className='md:pt-12'>
        <h1 className="text-2xl font-bold text-gray-800">Slip Gaji</h1>
        <p className="text-gray-600 mt-1">Lihat rincian gaji dan riwayat pembayaran</p>
      </div>

      {currentGaji ? (
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-green-100 mb-2">Gaji Bulan Ini</p>
              <h2 className="text-4xl font-bold">{formatRupiah(Number(currentGaji.gaji_bersih))}</h2>
              <p className="text-green-100 mt-2">{getBulanName(currentGaji.bulan)} {currentGaji.tahun}</p>
            </div>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-4xl text-green-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-green-400">
            <div>
              <p className="text-green-100 text-sm">Gaji Pokok</p>
              <p className="text-xl font-bold mt-1">{formatRupiah(Number(currentGaji.gaji_pokok))}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Tunjangan</p>
              <p className="text-xl font-bold mt-1">+ {formatRupiah(Number(currentGaji.total_tunjangan))}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Potongan</p>
              <p className="text-xl font-bold mt-1">- {formatRupiah(Number(currentGaji.total_potongan))}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
          Gaji bulan ini belum tersedia.
        </div>
      )}

      {currentGaji && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Rincian Gaji Bulan Ini</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Pendapatan</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Gaji Pokok</span>
                  <span className="font-semibold text-gray-800">{formatRupiah(Number(currentGaji.gaji_pokok))}</span>
                </div>
                {currentGaji.detail_tunjangan && currentGaji.detail_tunjangan.split(', ').map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{d.split(': ')[0]}</span>
                    <span className="font-semibold text-gray-800">{d.split(': ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Potongan</h4>
              <div className="space-y-2">
                {currentGaji.detail_potongan ? (
                  currentGaji.detail_potongan.split(', ').map((d, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">{d.split(': ')[0]}</span>
                      <span className="font-semibold text-red-600">-{d.split(': ')[1]}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Tidak ada potongan</span>
                    {/* <span className="font-semibold text-green-600">Rp 0</span> */}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-lg font-bold text-gray-800">Total Gaji Bersih</span>
                <span className="text-2xl font-bold text-green-600">{formatRupiah(Number(currentGaji.gaji_bersih))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Riwayat Pembayaran Gaji</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Gaji Pokok
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tunjangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Potongan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gajiHistory.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{getBulanName(item.bulan)} {item.tahun}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatRupiah(Number(item.gaji_pokok))}</td>
                  <td className="px-6 py-4 text-green-600">{formatRupiah(Number(item.total_tunjangan))}</td>
                  <td className="px-6 py-4 text-red-600">{formatRupiah(Number(item.total_potongan))}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{formatRupiah(Number(item.gaji_bersih))}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${item.status_bayar === 'sudah_dibayar' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-xs font-semibold rounded-full capitalize whitespace-nowrap`}>
                      {item.status_bayar.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
