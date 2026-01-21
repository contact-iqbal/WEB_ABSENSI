'use client'
import { useState } from "react";

export default function PengaturanPage() {
  const [section, Setsection] = useState<Number | null>(1)

  const items = [
    {
      id: 1,
      section: 'Umum'
    },
    {
      id: 2,
      section: 'Jam Kerja'
    },
    {
      id: 3,
      section: 'Notifikasi'
    },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Kelola pengaturan sistem absensi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-1">
              {items.map((itm) => (
                <button key={itm.id} className={`w-full text-left px-4 py-3 ${section === itm.id ? 'bg-blue-50 text-blue-700 rounded-lg font-medium' : 'text-gray-700 hover:bg-gray-50 rounded-lg'}`} onClick={() => (Setsection(itm.id))}>
                {itm.section}
              </button>
              ))}
              {/* <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium" onClick={() => (Setsection(1))}>
                Umum
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => (Setsection(2))}>
                Jam Kerja
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => (Setsection(3))}>
                Gaji & Tunjangan
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => (Setsection(4))}>
                Notifikasi
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => (Setsection(5))}>
                Pengguna
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => (Setsection(6))}>
                Backup & Restore
              </button> */}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {section == 1 &&
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Pengaturan Umum
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama perusahaan"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Perusahaan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan alamat perusahaan"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      placeholder="Nomor telepon"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Email perusahaan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          }
          {section == 2 &&
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Jam Kerja Default
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Masuk
                    </label>
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Pulang
                    </label>
                    <input
                      type="time"
                      defaultValue="17:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toleransi Keterlambatan (menit)
                  </label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="weekend"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="weekend" className="text-sm text-gray-700">
                    Aktifkan absensi akhir pekan (Sabtu & Minggu)
                  </label>
                </div>
              </div>
            </div>
          }
          {section == 3 &&
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Komponen Gaji
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Tunjangan Transport</p>
                    <p className="text-sm text-gray-600">Per hari</p>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Tunjangan Makan</p>
                    <p className="text-sm text-gray-600">Per hari</p>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Potongan Alpha</p>
                    <p className="text-sm text-gray-600">Per hari</p>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          }
          <div className="flex justify-end gap-3">
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Batal
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
