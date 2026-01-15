'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faBriefcase, faCalendar, faEdit } from '@fortawesome/free-solid-svg-icons';

export default function ProfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-gray-600 mt-1">Informasi data pribadi dan pekerjaan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white mb-4">
                <FontAwesomeIcon icon={faUser} className="text-5xl" />
              </div>

              <h3 className="text-xl font-bold text-gray-800">Nama Pegawai</h3>
              <p className="text-gray-600 mt-1">Staff IT</p>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-500 text-xs">ID Pegawai</p>
                    <p className="font-medium text-gray-800">PGW-001</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendar} className="text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-500 text-xs">Tanggal Bergabung</p>
                    <p className="font-medium text-gray-800">1 Januari 2024</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faBriefcase} className="text-orange-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className="font-medium text-gray-800">Pegawai Tetap</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Foto
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Data Pribadi</h3>
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Nama Lengkap
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Nama Pegawai</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  NIK
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">1234567890123456</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tempat Lahir
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Jakarta</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tanggal Lahir
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">1 Januari 1990</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Jenis Kelamin
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Laki-laki</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Agama
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Islam</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Alamat
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Jl. Contoh No. 123, Jakarta Selatan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Kontak</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">pegawai@example.com</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Nomor Telepon
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">0812-3456-7890</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Data Pekerjaan</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  ID Pegawai
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">PGW-001</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Jabatan
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Staff IT</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Departemen
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">IT</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Status Kepegawaian
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Pegawai Tetap</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tanggal Bergabung
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">1 Januari 2024</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Gaji Pokok
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">Rp 5.000.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
