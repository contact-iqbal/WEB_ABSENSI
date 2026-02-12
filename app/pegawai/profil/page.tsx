'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faBriefcase, faCalendar, faEdit, faL, faSave } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

interface profilestructure {
  id: Number,
  NIK: Number,
  nama: String,
  acc_created: Date,
  agama: String,
  alamat: String,
  devisi: String,
  email: String,
  gaji_pokok: Number,
  jabatan: String,
  jenis_kel: String,
  no_telp: String,
  profile_picture: any,
  status: String,
  tanggal_lahir: Date,
  tempat_lahir: String
}

export default function ProfilPage() {
  const [profiledata, Setprofiledata] = useState<profilestructure | null>(null)
  const [edit, Setedit] = useState(false)

  function dateformat(date: any) {
    return new Intl.DateTimeFormat('en-id', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(new Date(date));
  }

  const getdata = async () => {
    const session = await fetch('/api/auth/session')
    const sessionresult = await session.json()
    const datas = await fetch('/api/karyawan/personal_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: sessionresult.userId,
      })
    }
    )
    const dataresult = await datas.json()

    if (dataresult.success) {
      Setprofiledata(dataresult.result[0])
    }
  }

  function aliasesdevisi(alias: String) {
    if (alias === "RT") {
      return "Rizqi Tour"
    } else if (alias === "DNA") {
      return "DNA Jaya Group"
    } else {
      return ""
    }
  }
  function aliasesstatus(alias: String) {
    if (alias === "pegawai_tetap") {
      return "Karyawan Tetap"
    } else {
      return "-"
    }
  }

  useEffect(() => {
    getdata()
  }, [])

  function formatIndoPhone(input: String) {
    if (!input) return "";
    let digits = input.replace(/\D/g, "");
    if (digits.startsWith("08")) {
      digits = "62" + digits.slice(1);
    }
    if (!digits.startsWith("62")) {
      return "";
    }

    const local = digits.slice(2);
    const p1 = local.slice(0, 3);
    const p2 = local.slice(3, 7);
    const p3 = local.slice(7, 11);

    if (!p1 || !p2 || !p3) return "";

    return `+62-${p1}-${p2}-${p3}`;
  }

  function handleedit() {
    if (edit) {
      Setedit(false)
    } else {
      Setedit(true)
    }
  }
  return (
    <div className="space-y-6">
      <div className='pt-12'>
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-gray-600 mt-1">Informasi data pribadi dan pekerjaan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white mb-4 overflow-hidden">
                {profiledata != null &&
                  (profiledata.profile_picture ? <img src={profiledata && (profiledata.profile_picture)} alt="profile picture" /> : <FontAwesomeIcon icon={faUser} size={"4x"} className="text-base" />)
                }
              </div>
              <h3 className="text-xl font-bold text-gray-800">{profiledata ? profiledata.nama : ''}</h3>
              <p className="text-gray-600 mt-1">{profiledata ? aliasesdevisi(profiledata.devisi) : ''}</p>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-500 text-xs">ID Pegawai</p>
                    <p className="font-medium text-gray-800">{profiledata ? String(profiledata.id) : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendar} className="text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-500 text-xs">Tanggal Bergabung</p>
                    <p className="font-medium text-gray-800">{profiledata ? dateformat(profiledata.acc_created) : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faBriefcase} className="text-orange-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className="font-medium text-gray-800">{profiledata ? aliasesstatus(profiledata.status) : ''}</p>
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
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors" onClick={handleedit}>
                {edit ? 
                <><FontAwesomeIcon icon={faSave} className="mr-2" />
                Simpan</>
                :
                <>
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit</>
              }
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Nama Lengkap
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? profiledata.nama : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  NIK
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? String(profiledata.NIK) : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tempat Lahir
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? profiledata.tempat_lahir : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tanggal Lahir
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? String(profiledata.tanggal_lahir) : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Jenis Kelamin
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? profiledata.jenis_kel : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Agama
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? profiledata.agama : ''}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Alamat
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  {edit ?
                    <input type="text" defaultValue={profiledata ? String(profiledata.alamat) : ''} readOnly={false} className='text-neutral-800 border-2 outline-none w-full' />
                    :
                    <p className="text-gray-800 font-medium">{profiledata ? String(profiledata.alamat) : ''}</p>
                  }
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
                  <p className="text-gray-800 font-medium">{profiledata ? profiledata.email : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Nomor Telepon
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{formatIndoPhone(profiledata ? String(profiledata.no_telp) : '')}</p>
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
                  <p className="text-gray-800 font-medium">{profiledata ? String(profiledata.id) : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Jabatan
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? profiledata.jabatan : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Departemen
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? aliasesdevisi(profiledata.devisi) : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Status Kepegawaian
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? aliasesstatus(profiledata.status) : ''}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tanggal Bergabung
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-medium">{profiledata ? dateformat(profiledata.acc_created) : ''}</p>
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
