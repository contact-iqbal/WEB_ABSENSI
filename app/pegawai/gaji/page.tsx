'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faDownload, faEye, faCalendar } from '@fortawesome/free-solid-svg-icons';

export default function GajiPegawaiPage() {
  const riwayatGaji = [
    { bulan: 'Januari 2024', gajiPokok: 5000000, tunjangan: 1000000, potongan: 0, total: 6000000, status: 'Dibayar' },
    { bulan: 'Desember 2023', gajiPokok: 5000000, tunjangan: 1000000, potongan: 100000, total: 5900000, status: 'Dibayar' },
    { bulan: 'November 2023', gajiPokok: 5000000, tunjangan: 1000000, potongan: 0, total: 6000000, status: 'Dibayar' },
    { bulan: 'Oktober 2023', gajiPokok: 5000000, tunjangan: 1000000, potongan: 50000, total: 5950000, status: 'Dibayar' },
  ];

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Slip Gaji</h1>
        <p className="text-gray-600 mt-1">Lihat rincian gaji dan riwayat pembayaran</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-green-100 mb-2">Gaji Bulan Ini</p>
            <h2 className="text-4xl font-bold">Rp 6.000.000</h2>
            <p className="text-green-100 mt-2">Januari 2024</p>
          </div>
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-4xl" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-green-400">
          <div>
            <p className="text-green-100 text-sm">Gaji Pokok</p>
            <p className="text-xl font-bold mt-1">Rp 5.000.000</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Tunjangan</p>
            <p className="text-xl font-bold mt-1">+ Rp 1.000.000</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Potongan</p>
            <p className="text-xl font-bold mt-1">- Rp 0</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Rincian Gaji Bulan Ini</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Pendapatan</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Gaji Pokok</span>
                <span className="font-semibold text-gray-800">{formatRupiah(5000000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Tunjangan Transport</span>
                <span className="font-semibold text-gray-800">{formatRupiah(500000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Tunjangan Makan</span>
                <span className="font-semibold text-gray-800">{formatRupiah(500000)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Potongan</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">BPJS Kesehatan</span>
                <span className="font-semibold text-red-600">{formatRupiah(0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">BPJS Ketenagakerjaan</span>
                <span className="font-semibold text-red-600">{formatRupiah(0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Potongan Lainnya</span>
                <span className="font-semibold text-red-600">{formatRupiah(0)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-lg font-bold text-gray-800">Total Gaji Bersih</span>
              <span className="text-2xl font-bold text-green-600">{formatRupiah(6000000)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <FontAwesomeIcon icon={faDownload} />
              Download Slip Gaji
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              <FontAwesomeIcon icon={faEye} />
              Lihat Detail
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Riwayat Pembayaran Gaji</h3>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {riwayatGaji.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{item.bulan}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatRupiah(item.gajiPokok)}</td>
                  <td className="px-6 py-4 text-green-600">{formatRupiah(item.tunjangan)}</td>
                  <td className="px-6 py-4 text-red-600">{formatRupiah(item.potongan)}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{formatRupiah(item.total)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      <FontAwesomeIcon icon={faDownload} className="mr-2" />
                      Download
                    </button>
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
