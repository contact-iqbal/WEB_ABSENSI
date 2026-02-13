'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faMoneyBillWave, faUsers, faChartLine, faFileExport } from '@fortawesome/free-solid-svg-icons';

export default function LaporanPage() {
  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
          <p className="text-gray-600 mt-1">Lihat dan export berbagai laporan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faChartBar} className="text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Laporan Absensi</h3>
              <p className="text-sm text-gray-600 mt-1">Rekap absensi karyawan</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Generate Laporan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Laporan Gaji</h3>
              <p className="text-sm text-gray-600 mt-1">Rekap penggajian</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Generate Laporan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center text-orange-600">
              <FontAwesomeIcon icon={faUsers} className="text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Laporan Karyawan</h3>
              <p className="text-sm text-gray-600 mt-1">Data karyawan</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
            Generate Laporan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Laporan</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Laporan
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Pilih Jenis Laporan</option>
              <option>Laporan Absensi</option>
              <option>Laporan Gaji</option>
              <option>Laporan Karyawan</option>
              <option>Laporan Kinerja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Bulan Ini</option>
              <option>Bulan Lalu</option>
              <option>3 Bulan Terakhir</option>
              <option>6 Bulan Terakhir</option>
              <option>Tahun Ini</option>
              <option>Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format Export
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Excel (.xlsx)</option>
              <option>PDF (.pdf)</option>
              <option>CSV (.csv)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faChartLine} />
            Tampilkan Laporan
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faFileExport} />
            Export Laporan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Export</h3>
        <div className="text-center py-8 text-gray-500">
          Belum ada riwayat export laporan
        </div>
      </div>
    </div>
  );
}
