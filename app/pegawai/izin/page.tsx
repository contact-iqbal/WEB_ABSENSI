'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileAlt, faCheck, faClock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { showSuccess } from '@/lib/sweetalert';

export default function IzinPage() {
  const [showForm, setShowForm] = useState(false);

  const riwayatIzin = [
    { tanggal: '10-12 Jan 2024', jenis: 'Cuti Tahunan', keterangan: 'Liburan keluarga', status: 'Disetujui', statusColor: 'green' },
    { tanggal: '5 Jan 2024', jenis: 'Izin Sakit', keterangan: 'Flu', status: 'Disetujui', statusColor: 'green' },
    { tanggal: '20 Des 2023', jenis: 'Izin Pribadi', keterangan: 'Keperluan keluarga', status: 'Menunggu', statusColor: 'yellow' },
    { tanggal: '15 Des 2023', jenis: 'Cuti Tahunan', keterangan: 'Liburan', status: 'Ditolak', statusColor: 'red' },
  ];

  const handleSubmitIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    await showSuccess('Pengajuan Berhasil!', 'Permohonan izin Anda telah diajukan');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Izin & Cuti</h1>
          <p className="text-gray-600 mt-1">Ajukan dan kelola izin atau cuti Anda</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FontAwesomeIcon icon={faPlus} />
          Ajukan Izin/Cuti
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Sisa Cuti</p>
              <h3 className="text-2xl font-bold text-gray-800">12 Hari</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faCheck} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Disetujui</p>
              <h3 className="text-2xl font-bold text-gray-800">8</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center text-yellow-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Menunggu</p>
              <h3 className="text-2xl font-bold text-gray-800">1</h3>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Form Pengajuan Izin/Cuti</h3>

          <form onSubmit={handleSubmitIzin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Izin/Cuti
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Pilih Jenis</option>
                  <option>Cuti Tahunan</option>
                  <option>Izin Sakit</option>
                  <option>Izin Pribadi</option>
                  <option>Cuti Menikah</option>
                  <option>Cuti Melahirkan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durasi
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>1 Hari</option>
                  <option>2 Hari</option>
                  <option>3 Hari</option>
                  <option>4-7 Hari</option>
                  <option>Lebih dari 7 Hari</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan
              </label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan alasan pengajuan izin/cuti..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Dokumen Pendukung (Opsional)
              </label>
              <input
                type="file"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ajukan Permohonan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Pengajuan</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Keterangan
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
              {riwayatIzin.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{item.tanggal}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.jenis}</td>
                  <td className="px-6 py-4 text-gray-600">{item.keterangan}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 bg-${item.statusColor}-100 text-${item.statusColor}-700 text-xs font-semibold rounded-full`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-800 mb-3">Informasi Penting:</h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li>• Pengajuan cuti tahunan harus dilakukan minimal 3 hari sebelum tanggal cuti</li>
          <li>• Untuk cuti lebih dari 3 hari, wajib melampirkan surat keterangan</li>
          <li>• Izin sakit harus disertai surat keterangan dokter jika lebih dari 2 hari</li>
          <li>• Pengajuan akan diproses maksimal 2 hari kerja</li>
        </ul>
      </div>
    </div>
  );
}
