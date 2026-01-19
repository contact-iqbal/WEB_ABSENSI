'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

export default function GajiPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Penggajian</h1>
          <p className="text-gray-600 mt-1">Kelola gaji dan pembayaran karyawan</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faSync} />
            Hitung Otomatis
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faMoneyBillWave} />
            Proses Gaji
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Total Gaji Bulan Ini</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">Rp 0</h3>
          <p className="text-xs text-gray-500 mt-1">0 karyawan</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Sudah Dibayar</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">Rp 0</h3>
          <p className="text-xs text-gray-500 mt-1">0 karyawan</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Belum Dibayar</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">Rp 0</h3>
          <p className="text-xs text-gray-500 mt-1">0 karyawan</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Potongan</p>
          <h3 className="text-2xl font-bold text-yellow-600 mt-2">Rp 0</h3>
          <p className="text-xs text-gray-500 mt-1">Total potongan</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Januari 2024</option>
              <option>Februari 2024</option>
              <option>Maret 2024</option>
            </select>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari karyawan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Semua Status</option>
              <option>Sudah Dibayar</option>
              <option>Belum Dibayar</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Karyawan
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
                  Total Gaji
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
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Belum ada data penggajian. Silakan hitung gaji otomatis berdasarkan absensi.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
