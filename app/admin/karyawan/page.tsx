'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faPlus, faDeleteLeft, faTrash, faPencil, faCheck, faCheckCircle, faCheckToSlot, faSave, faL } from '@fortawesome/free-solid-svg-icons';
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
interface pendingUpdate {
  id: Number,
  action: String,
  value?: pendingUpdateValue
}
interface pendingUpdateValue {
  nama?: String,
  jabatan?: String,
  devisi?: String
}
export default function KaryawanPage() {
  const [Karyawan, SetKaryawan] = useState<karyawan[]>([]);
  const [editing, Setediting] = useState<null | Number>(0);
  let [pendingUpdate, SetpendingUpdate] = useState<pendingUpdate>({
    id: 0,
    action: 'update',
    value: (
      {
        nama: '',
        jabatan: '',
        devisi: ''
      }
    )
  })
  useEffect(() => {
    fetchkaryawan()
  }, [])
  const fetchkaryawan = async () => {
    const responses = await fetch('/api/admin/karyawan')
    const result = await responses.json();

    if (result.success) {
      SetKaryawan(result.result)
    }
  }

  const handleEditSave = (k: any) => {
    if (editing === k.id) {
      // SAVE
      if (k.nama != pendingUpdate.value?.nama || k.jabatan != pendingUpdate.value?.jabatan || k.devisi != pendingUpdate.value?.devisi) {
        handlechange(k.id, pendingUpdate.value)
      }
      Setediting(null)

      SetpendingUpdate({
        id: 0,
        action: 'update',
        value: {
          nama: '',
          jabatan: '',
          devisi: '',
        },
      })
    } else {
      // EDIT
      Setediting(k.id)

      SetpendingUpdate({
        id: k.id,
        action: 'update',
        value: {
          nama: k.nama,
          jabatan: k.jabatan,
          devisi: k.devisi,
        },
      })
    }
  }


  const handlechange = async (id: Number, value: any) => {
    const updatestuff = await fetch('/api/admin/karyawan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        action: 'update',
        value: value
      })
    });
    const resultupdate = await updatestuff.json()
    if (resultupdate.success) {
      await showSuccess("Sukses", `${resultupdate.message}`)
    } else if (!resultupdate.success == false && !resultupdate.error) {
      await showInfo("Huh?", `${resultupdate.message || resultupdate.error || resultupdate.toString()}`)
    }
    fetchkaryawan()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
          <p className="text-gray-600 mt-1">Kelola data karyawan perusahaan</p>
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
              <option>Semua Devisi</option>
              <option>DNA Jaya Group</option>
              <option>Rizqi Tour</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2.5">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Jabatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Devisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                  {editing == k.id ?
                    <td className='p-2'>
                      <input type="text" className='w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg'
                        value={String(pendingUpdate.value?.nama ?? '')}
                        onChange={(e) =>
                          SetpendingUpdate(prev => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              nama: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    :
                    <td className="px-6 py-4 text-gray-600">{k.nama}</td>
                  }
                  {editing == k.id ?
                    <td className="p-2 text-gray-600">
                      <select name="jabatan" id="jabatan" className='w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg'
                        value={String(pendingUpdate.value?.jabatan ?? '')}

                        onChange={(e) =>
                          SetpendingUpdate(prev => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              jabatan: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="karyawan">Karyawan</option>
                        <option value="bendahara">Bendahara</option>
                      </select>
                    </td>
                    :
                    <td className="px-6 py-4 text-gray-600 capitalize">{k.jabatan}</td>
                  }
                  {editing == k.id ?
                    <td className="p-2 text-gray-600">
                      <select name="devisi" id="devisi" className='w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg'
                        value={String(pendingUpdate.value?.devisi ?? '')}

                        onChange={(e) =>
                          SetpendingUpdate(prev => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              devisi: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="default">-</option>
                        <option value="DNA">DNA Jaya Group</option>
                        <option value="RT">Rizqi Tour</option>
                      </select>
                    </td>
                    :
                    <td className="px-6 py-4 text-gray-600 capitalize">{k.devisi == 'default' ? '-' : (k.devisi == 'DNA' ? 'DNA Jaya Group' : (k.devisi == 'RT' ? 'Rizqi Tour' : ''))}</td>
                  }
                  <td className="px-6 py-4">
                    {k.status != 'default' &&
                      <span className={`px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full`}>
                        {k.status}
                      </span>
                    }
                  </td>
                  <td className="flex px-6 py-4 justify-end gap-1">
                    {k.id !== 1 && (
                      <>
                        <button className='bg-blue-500 p-1.5 hover:bg-blue-600 hover:scale-105 rounded-lg transition cursor-pointer'
                          onClick={() => (handleEditSave(k))}
                        >
                          {editing == k.id ?
                            <div className='flex flex-row justify-center items-center w-fit gap-2'><p>Apply</p><FontAwesomeIcon icon={faSave} /></div>
                            :
                            <FontAwesomeIcon icon={faPencil} />
                          }

                        </button>
                        {/* <button className='bg-red-500 p-1.5 hover:bg-red-600 hover:scale-105 rounded-lg transition cursor-pointer' onClick={() => (handledelete(k.id))}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button> */}
                      </>
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
