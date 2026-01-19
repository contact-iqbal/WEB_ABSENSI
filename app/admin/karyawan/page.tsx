'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faPlus, faDeleteLeft, faTrash, faPencil } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { showConfirm, showError, showInfo, showSuccess } from '@/lib/sweetalert';

interface karyawan {
  id: Number,
  nama: String,
  jabatan: String,
  devisi: String,
  status: String,
}
export default function KaryawanPage() {
  const [Karyawan, SetKaryawan] = useState<karyawan[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<Number | null>(null);

  const router = useRouter()
  useEffect(() => {
    fetchkaryawan()
  }, [])
  const fetchkaryawan = async () => {
    const responses = await fetch('/api/admin/account')
    const result = await responses.json();

    if (result.success) {
      SetKaryawan(result.result)
      //console.log(result.result)
    }
  }
  const handlecreate = async () => {
    Swal.fire({
      title: "Buat akun",
      html: `
        <input id="username" class="swal2-input">
        <input id="password" class="swal2-input">
      `,
      showCancelButton: true,
      confirmButtonText: "Buat Akun",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const usernameInput = (document.getElementById('username') as HTMLInputElement);
        const passwordInput = (document.getElementById('password') as HTMLInputElement);
        const usernameValue = usernameInput.value;
        const passwordValue = passwordInput.value;
        try {
          const response = await fetch('/api/admin/account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: usernameValue,
              password: passwordValue,
              action: 'create'
            })
          })
          if (!response.ok) {
            const data = await response.json();
            // console.log(JSON.stringify(data.error))
            return Swal.showValidationMessage(`
            ${(data.error).replace(/"/g, '')}`
            );
          }
          return response.json();
        } catch (error) {
          Swal.showValidationMessage(`
            Request failed: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(async (result) => {
      if (result.isConfirmed) {
        await Swal.fire({
          icon: 'success',
          title: `Sukses!`,
          text: result.value.message
        });
        fetchkaryawan()
      } else if (!result.isDismissed && !result.isDenied) {
        await Swal.fire({
          icon: 'error',
          title: `Uh oh`,
          text: result.value?.error
        });
      }
    })
  }

  const handledelete = async (i: Number) => {
    try {
      const sweetalertconfirm = (await showConfirm("Confimation", "Apakah anda yakin ingin hapus akun ini?")).isConfirmed;
      if (sweetalertconfirm) {
        const delacc = await fetch('/api/admin/account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: i,
            action: 'delete'
          })
        });
        const resultdel = await delacc.json()
        if (resultdel.success) {
          await showSuccess('Sukses!', resultdel.message)
          fetchkaryawan()
        } else {
          await showError('Gagal!', resultdel.error || resultdel.message)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
          <p className="text-gray-600 mt-1">Kelola data karyawan perusahaan</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faFileImport} />
            Import Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" onClick={handlecreate}>
            <FontAwesomeIcon icon={faPlus} />
            Tambah Karyawan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari karyawan..."
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Semua Departemen</option>
              <option>IT</option>
              <option>HRD</option>
              <option>Finance</option>
              <option>Marketing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jabatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Departemen
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
              {Karyawan.map((k) => (
                <tr key={k.id as number} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{k.id.toString()}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{k.nama}</td>
                  <td className="px-6 py-4 text-gray-600">{k.jabatan}</td>
                  <td className="px-6 py-4 text-gray-600">{k.devisi == 'default' ? '-' : k.devisi}</td>
                  <td className="px-6 py-4">
                    {k.status != 'default' &&
                      <span className={`px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full`}>
                        {k.status == 'default' ? '-' : k.status}
                      </span>
                    }
                  </td>
                  <td className="flex px-6 py-4 gap-1">
                    {k.id !== 1 && (
                      <><button className='bg-blue-500 p-1.5 hover:bg-blue-600 hover:scale-105 rounded-lg transition'>
                        <FontAwesomeIcon icon={faPencil} />
                      </button><button className='bg-red-500 p-1.5 hover:bg-red-600 hover:scale-105 rounded-lg transition' onClick={() => (handledelete(k.id))}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button></>
                    )}
                  </td>
                </tr>
              ))
              }
              {Karyawan.length == 0 &&
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Belum ada data karyawan. Silakan tambah data atau import dari Excel.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div >
    </div >
  );
}
