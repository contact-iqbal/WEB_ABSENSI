'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faPlus, faDeleteLeft, faTrash, faPencil, faCheck, faCheckCircle, faCheckToSlot, faSave, faL, faWarning, faFileExcel, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { showConfirm, showError, showInfo, showSuccess } from '@/lib/sweetalert';
import * as XLSX from 'xlsx';

interface karyawan {
  id: Number,
  username: String,
  password: String,
  devisi: String,
  status: String,
}
interface pendingUpdate {
  id: Number,
  action: String,
  value?: pendingUpdateValue
}
interface pendingUpdateValue {
  username?: String,
  password?: String,
}
export default function KaryawanPage() {
  const [Karyawan, SetKaryawan] = useState<karyawan[]>([]);
  const [AccInfo, SetAccInfo] = useState([]);
  const [editing, Setediting] = useState<null | Number>(0);
  const router = useRouter()
  let [pendingUpdate, SetpendingUpdate] = useState<pendingUpdate>({
    id: 0,
    action: 'update',
    value: (
      {
        username: '',
        password: ''
      }
    )
  })
  useEffect(() => {
    fetchkaryawan()
  }, [])
  const fetchkaryawan = async () => {
    const responses = await fetch('/api/admin/account')
    const result = await responses.json();

    if (result.success) {
      SetKaryawan(result.result)
    }
  }
  const handlecreate = async () => {
    Swal.fire({
      title: "Buat akun",
      html: `
        <input id="username" class="swal2-input" placeholder="Username">
        <input id="password" class="swal2-input" placeholder="Password">
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

  const handleEditSave = (k: any) => {
    if (editing === k.id) {
      // SAVE
      if (k.username != pendingUpdate.value?.username || k.password != pendingUpdate.value?.password) {
        handlechange(k.id, pendingUpdate.value)
      }
      Setediting(null)

      SetpendingUpdate({
        id: 0,
        action: 'update',
        value: {
          username: '',
          password: ''
        },
      })
    } else {
      // EDIT
      Setediting(k.id)

      SetpendingUpdate({
        id: k.id,
        action: 'update',
        value: {
          username: k.username,
          password: k.password,
        },
      })
    }
  }


  const handlechange = async (id: Number, value: any) => {
    const updatestuff = await fetch('/api/admin/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        action: 'update',
        username: value.username,
        password: value.password
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

  const exportexcel = async () => {
    const combine = new Map()
    const responses_account = await fetch('/api/admin/account')
    const result_account = await responses_account.json();
    const responses_karyawan = await fetch('/api/admin/karyawan')
    const result_karyawan = await responses_karyawan.json();

    result_account?.result?.forEach((accounts: { id: any; }) => {
      combine.set(accounts.id, accounts)
    });

    const combinedarray = result_karyawan.result.map((karyawan: { id: any; }) => {
      const akundetail = combine.get(karyawan.id)
      return {
        ...karyawan,
        ...akundetail
      }
    })

    function formatStatus(status: string) {
      if (!status) return "";
      return status
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    function formatDivisi(divisi: string) {
      if (!divisi) return "";
      if (divisi == 'DNA') {
        return 'DNA Jaya Group';
      } else if (divisi == 'RT') {
        return 'Rizqi Tour';
      } else {
        return divisi.toUpperCase();
      }
    }
    function formatDate(date: string | number | Date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("id-ID");
    }
    const cleanedData = combinedarray.map((emp: {
      password: any; id: any; nama: any; jabatan: any; devisi: any; status: any; NIK: any; tempat_lahir: any; tanggal_lahir: any; jenis_kel: any; agama: any; alamat: any; email: any; no_telp: any; gaji_pokok: any; username: any; type: any; acc_created: any;
    }) => ({
      ID: emp.id,
      Nama: emp.nama || "",
      Jabatan: emp.jabatan.toUpperCase(),
      Divisi: formatDivisi(emp.devisi),
      Status: formatStatus(emp.status),
      NIK: emp.NIK || "",
      'Tempat Lahir': emp.tempat_lahir || "",
      'Tanggal Lahir': formatDate(emp.tanggal_lahir),
      'Jenis Kelamin': emp.jenis_kel || "",
      Agama: emp.agama || "",
      Alamat: emp.alamat || "",
      Email: emp.email || "",
      'No Telp': emp.no_telp || "",
      'Gaji Pokok': emp.gaji_pokok || 0,
      Username: emp.username,
      Password: emp.password,
      'Tanggal Dibuat': formatDate(emp.acc_created)
    }));

    const worksheet = XLSX.utils.json_to_sheet(cleanedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet)
    const cols = Object.keys(cleanedData[0]);
    const colWidths = cols.map((col) => {
      const maxLength = Math.max(
        col.length,
        ...cleanedData.map((row: { [x: string]: { toString: () => { (): any; new(): any; length: any; }; }; }) => (row[col] ? row[col].toString().length : 0))
      );
      return { wch: maxLength + 2 };
    });
    worksheet["!cols"] = colWidths;
    try {
      XLSX.writeFile(workbook, 'data.xlsx', { compression: true })
      const toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        customClass: {
          popup: 'colored-toast',
        },
        iconColor: 'white',
        timer: 3000,
        timerProgressBar: true,
      })
      toast.fire({ icon: 'info', title: 'Download akan dimulai' })
    } catch (e) {
      console.log(e)
    }

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Akun Karyawan</h1>
          <p className="text-gray-600 mt-1">Kelola akun karyawan perusahaan</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faFileImport} />
            Import Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium" onClick={() => (exportexcel())}>
            <FontAwesomeIcon icon={faFileExport} />
            Export to Excel
          </button>
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" onClick={handlecreate}>
            <FontAwesomeIcon icon={faPlus} />
            Tambah Karyawan
          </button> */}
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
              <option>Semua</option>
              <option>IT</option>
              <option>HRD</option>
              <option>Finance</option>
              <option>Marketing</option>
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
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  password
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
                        value={String(pendingUpdate.value?.username ?? '')}
                        onChange={(e) =>
                          SetpendingUpdate(prev => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              username: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    :
                    <td className="px-6 py-4 text-gray-600">{k.username}</td>
                  }
                  {editing == k.id ?
                    <td className="p-2 text-gray-600 truncate">
                      <input type="text" className='w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg'
                        placeholder={String(pendingUpdate.value?.password ?? '')}
                        onChange={(e) =>
                          SetpendingUpdate(prev => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              password: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    :
                    <td className="px-6 py-4 text-gray-600 truncate">{k.password}</td>
                  }
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
                        <button className='bg-red-500 p-1.5 hover:bg-red-600 hover:scale-105 rounded-lg transition cursor-pointer' onClick={() => (handledelete(k.id))}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
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
      <p className='text-neutral-500 w-full pl-3'><FontAwesomeIcon icon={faWarning} /> jika lupa password, password tidak bisa dibaca dan hanya bisa di ganti</p>
    </div >
  );
}
