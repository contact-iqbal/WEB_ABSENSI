'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faCheck, faClock, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export default function AbsensiPegawaiPage() {
  const riwayatAbsensi = [
    { tanggal: 'Senin, 15 Jan 2024', jamMasuk: '08:00', jamKeluar: '17:00', status: 'Hadir', statusColor: 'green' },
    { tanggal: 'Selasa, 16 Jan 2024', jamMasuk: '08:15', jamKeluar: '17:00', status: 'Terlambat', statusColor: 'yellow' },
    { tanggal: 'Rabu, 17 Jan 2024', jamMasuk: '08:00', jamKeluar: '17:00', status: 'Hadir', statusColor: 'green' },
    { tanggal: 'Kamis, 18 Jan 2024', jamMasuk: '-', jamKeluar: '-', status: 'Izin', statusColor: 'blue' },
    { tanggal: 'Jumat, 19 Jan 2024', jamMasuk: '-', jamKeluar: '-', status: 'Sakit', statusColor: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Absensi</h1>
        <p className="text-gray-600 mt-1">Lihat riwayat kehadiran Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faCheck} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Hadir</p>
              <h3 className="text-2xl font-bold text-gray-800">20</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center text-yellow-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Terlambat</p>
              <h3 className="text-2xl font-bold text-gray-800">2</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Izin</p>
              <h3 className="text-2xl font-bold text-gray-800">1</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center text-red-600">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Tanpa Kabar</p>
              <h3 className="text-2xl font-bold text-gray-800">0</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="month"
                defaultValue="2024-01"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jam Keluar
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Jam
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {riwayatAbsensi.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{item.tanggal}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.jamMasuk}</td>
                  <td className="px-6 py-4 text-gray-600">{item.jamKeluar}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.jamMasuk !== '-' ? '9 jam' : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 bg-${item.statusColor}-100 text-${item.statusColor}-700 text-xs font-semibold rounded-full`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.status === 'Izin' ? 'Keperluan keluarga' : item.status === 'Sakit' ? 'Flu' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Menampilkan 1-5 dari 23 data</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
              Sebelumnya
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faCalendarCheck} className="text-blue-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">Ringkasan Kehadiran Bulan Ini</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm mb-1">Total Hari Kerja</p>
            <p className="text-2xl font-bold text-gray-800">23</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-green-600 text-sm mb-1">Hadir</p>
            <p className="text-2xl font-bold text-green-700">20</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-yellow-600 text-sm mb-1">Terlambat</p>
            <p className="text-2xl font-bold text-yellow-700">2</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-600 text-sm mb-1">Persentase Kehadiran</p>
            <p className="text-2xl font-bold text-blue-700">87%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
