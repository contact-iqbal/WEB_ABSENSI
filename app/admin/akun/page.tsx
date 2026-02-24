'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faPlus, faDeleteLeft, faTrash, faPencil, faCheck, faCheckCircle, faCheckToSlot, faSave, faL, faWarning, faFileExcel, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { showConfirm, showError, showInfo, showSuccess, showToast } from '@/lib/sweetalert';
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
  const [selectedAccounts, setSelectedAccounts] = useState<Number[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    function formatColumnByHeader(ws: any, headerName: string, format: string) {
      const range = XLSX.utils.decode_range(ws["!ref"]);
      let colIndex = null;

      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[addr] && ws[addr].v === headerName) {
          colIndex = c;
          break;
        }
      }

      if (colIndex === null) return;

      for (let r = 1; r <= range.e.r; r++) {
        const addr = XLSX.utils.encode_cell({ r, c: colIndex });
        if (ws[addr]) ws[addr].z = format;
      }
    }
    worksheet["!cols"] = colWidths;
    formatColumnByHeader(worksheet, 'NIK', '0')
    formatColumnByHeader(worksheet, 'No Telp', '0')
    try {
      XLSX.writeFile(workbook, `${Date.now()}_data_karyawan.xlsx`, { compression: true })
      showToast('Download dimulai', 'info')
    } catch (e) {
      console.log(e)
    }

  }
  const [uploaded, setuploaded] = useState<{ file: File | null, fileName: string, isuploaded: boolean }>({ file: null, fileName: '', isuploaded: false });
  const handlechangefile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setuploaded({ file: file, fileName: file.name, isuploaded: true });
    }
  }

  const handleMassDelete = async () => {
    // const confirm = await showConfirm(
    //   "Konfirmasi Hapus",
    //   `Apakah Anda yakin ingin menghapus ${selectedAccounts.length} akun yang dipilih?`
    // );
    let confirm;
    Swal.fire({
      title: 'Apakah kamu yakin?',
      text: 'Akun yang dihapus, akan menghapus rekap absen, gaji, dan data karyawan tersebut!',
      icon: 'info',
      showConfirmButton: false,
      showCancelButton: false, 
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 3000,
      timerProgressBar: true,
      // didOpen: () => {
      // }
    }).then(async (result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        confirm = await Swal.fire({
          title: 'Konfirmasi',
          text: `Apakah Anda yakin ingin menghapus ${selectedAccounts.length} akun yang dipilih?`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Hapus',
          cancelButtonText: 'Cancel'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const res = await fetch('/api/admin/account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'mass_delete',
                  ids: selectedAccounts,
                }),
              });
              const result = await res.json();
              if (result.success) {
                showSuccess("Sukses", result.message);
                setSelectedAccounts([]);
                fetchkaryawan();
              } else {
                showError("Gagal", result.error || result.message);
              }
            } catch (err) {
              showError("Error", "Gagal menghubungi server.");
            }
          } 
          // else if (result.dismiss === Swal.DismissReason.cancel) {
          //   Swal.fire('Cancelled', 'You clicked the cancel button.', 'error');
          // }
        });
      }
    });
    // if (confirm.isConfirmed) {
    //   try {
    //     const res = await fetch('/api/admin/account', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         action: 'mass_delete',
    //         ids: selectedAccounts,
    //       }),
    //     });
    //     const result = await res.json();
    //     if (result.success) {
    //       showSuccess("Sukses", result.message);
    //       setSelectedAccounts([]);
    //       fetchkaryawan();
    //     } else {
    //       showError("Gagal", result.error || result.message);
    //     }
    //   } catch (err) {
    //     showError("Error", "Gagal menghubungi server.");
    //   }
    // }
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = Karyawan.map(k => k.id).filter(id => id !== 1); // Exclude admin
      setSelectedAccounts(allIds);
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectOne = (e: ChangeEvent<HTMLInputElement>, id: Number) => {
    if (e.target.checked) {
      setSelectedAccounts(prev => [...prev, id]);
    } else {
      setSelectedAccounts(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleImport = async () => {
    if (!uploaded.file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet);

        if (parsedData.length === 0) {
          showError('Gagal', 'File Excel kosong');
          return;
        }

        const confirm = await showConfirm('Konfirmasi', `Apakah anda yakin ingin mengimpor ${parsedData.length} data akun?`);
        if (!confirm.isConfirmed) return;

        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;

        for (const row of parsedData) {
          const rowId = row.ID || row.id;
          const username = row.Username || row.nama || row.Nama || row.username;

          if (!username) {
            failCount++;
            continue;
          }

          const idConflict = rowId ? Karyawan.find(k => k.id === rowId) : null;
          const usernameConflict = Karyawan.find(k => k.username === username);

          let action = 'create'; // Default action
          let targetId = rowId; // The ID to use for the update action

          if (idConflict) {
            // Priority 1: ID Conflict
            const result = await Swal.fire({
              title: `Konflik: Akun ID ${idConflict.id} sudah ada`,
              text: `Username: ${idConflict.username}. Apa yang ingin Anda lakukan?`,
              icon: 'warning',
              showDenyButton: true,
              showCancelButton: true,
              confirmButtonText: 'Timpa (Override)',
              denyButtonText: 'Lewati (Skip)',
              cancelButtonText: 'Buat Baru (Beda ID)',
              confirmButtonColor: '#3085d6',
              denyButtonColor: '#aaa',
              cancelButtonColor: '#d33'
            });

            if (result.isConfirmed) {
              action = 'update'; // Override
              targetId = idConflict.id;
            } else if (result.isDenied) {
              skipCount++;
              continue; // Skip
            } else {
              action = 'create'; // Create new
            }
          } else if (usernameConflict) {
            // Priority 2: Username Conflict (only if no ID conflict)
            const result = await Swal.fire({
              title: 'Konflik Username',
              text: `Username '${username}' sudah digunakan oleh akun dengan ID ${usernameConflict.id}. Apakah Anda ingin menimpa data akun tersebut?`,
              icon: 'warning',
              showDenyButton: true,
              confirmButtonText: 'Ya, Timpa (Override)',
              denyButtonText: 'Lewati (Skip)',
              confirmButtonColor: '#3085d6',
              denyButtonColor: '#aaa',
            });

            if (result.isConfirmed) {
              action = 'update';
              targetId = usernameConflict.id; // Target the ID of the user with the conflicting username
            } else {
              skipCount++;
              continue; // Skip
            }
          }

          const password = String(row.Password || row.password || '123456');
          const nama = row.Nama || row.nama || username;
          const jabatan = row.Jabatan || row.jabatan || 'karyawan';
          const devisi = row.Divisi || row.devisi || 'default';
          const status = row.Status || row.status || 'default';
          const NIK = row.NIK || row.nik || 0;
          const tempat_lahir = row['Tempat Lahir'] || row.tempat_lahir;
          const tanggal_lahir = row['Tanggal Lahir'] || row.tanggal_lahir;
          const jenis_kel = row['Jenis Kelamin'] || row.jenis_kel;
          const agama = row.Agama || row.agama;
          const alamat = row.Alamat || row.alamat;
          const email = row.Email || row.email;
          const no_telp = row['No Telp'] || row.no_telp;
          const gaji_pokok = row['Gaji Pokok'] || row.gaji_pokok || 0;

          if (!username && action === 'create') { // Only skip if creating a new user without a username
            failCount++;
            continue;
          }

          try {
            // The API for karyawan update expects a 'value' object
            const apiBody = {
              action: action,
              id: action === 'update' ? rowId : undefined,
              value: action === 'update' ? {
                nama, jabatan, devisi, status, NIK, tempat_lahir, tanggal_lahir, jenis_kel, agama, alamat, email, no_telp, gaji_pokok, username
              } : undefined,
              // 'create' action takes parameters at the top level
              username: action === 'create' ? String(username) : undefined,
              password: action === 'create' ? password : undefined,
              nama: action === 'create' ? String(nama) : undefined,
              jabatan: action === 'create' ? String(jabatan) : undefined,
              devisi: action === 'create' ? String(devisi) : undefined,
              status: action === 'create' ? String(status) : undefined,
              NIK: action === 'create' ? Number(NIK) : undefined,
              tempat_lahir: action === 'create' ? tempat_lahir : undefined,
              tanggal_lahir: action === 'create' ? tanggal_lahir : undefined,
              jenis_kel: action === 'create' ? jenis_kel : undefined,
              agama: action === 'create' ? agama : undefined,
              alamat: action === 'create' ? alamat : undefined,
              email: action === 'create' ? email : undefined,
              no_telp: action === 'create' ? no_telp : undefined,
              gaji_pokok: action === 'create' ? Number(gaji_pokok) : undefined,
            };

            const res = await fetch('/api/admin/karyawan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(apiBody)
            });

            const result = await res.json();
            if (result.success) {
              successCount++;
            } else {
              console.error('Import Error:', result.message);
              failCount++;
            }
          } catch (err) {
            console.error('Fetch Error:', err);

            failCount++;
          }
        }

        await showSuccess('Selesai', `${successCount} akun diproses, ${failCount} gagal, ${skipCount} dilewati.`);
        setuploaded({ file: null, fileName: '', isuploaded: false });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchkaryawan();
      };
      reader.readAsBinaryString(uploaded.file);
    } catch (err) {
      showError('Error', 'Gagal memproses file');
    }
  }

  return (
    <div className="space-y-6 pt-12">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Akun Karyawan</h1>
          <p className="text-gray-600 mt-1">Kelola akun karyawan perusahaan</p>
        </div>
        <div className="flex gap-3 flex-col md:flex-row">
          <div className='relative flex flex-row'>
            <button className={`flex items-center text-nowrap gap-2 px-4 py-2 bg-green-600 text-white ${uploaded.isuploaded ? 'rounded-tl-lg rounded-bl-lg' : 'rounded-lg'} hover:bg-green-700 transition-colors font-medium`} onClick={() => {
              if (uploaded.isuploaded) {
                handleImport();
              } else {
                fileInputRef.current?.click();
              }
            }}>
              <FontAwesomeIcon icon={faFileImport} />
              {uploaded.isuploaded ? 'Proses Impor' : 'Impor Excel'}
            </button>
            {uploaded.isuploaded ? (
              <>
                <button className='bg-red-500 hover:bg-red-600 px-3 rounded-tr-lg rounded-br-lg' onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  setuploaded({ file: null, fileName: '', isuploaded: false });
                }}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <span className='absolute top-10 right-0 text-black text-[10px] truncate max-w-[150px]'>{uploaded.fileName}</span>
              </>
            ) : ''}

          </div>
          <input type="file" ref={fileInputRef} onChange={handlechangefile} className='hidden' />
          <button className="flex items-center text-nowrap gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium" onClick={() => (exportexcel())}>
            <FontAwesomeIcon icon={faFileExport} />
            Export to Excel
          </button>
          <button
            className={`flex items-center text-nowrap gap-2 px-4 py-2 ${showCheckboxes ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors font-medium`}
            onClick={() => {
              setShowCheckboxes(!showCheckboxes);
              if (showCheckboxes) setSelectedAccounts([]);
            }}
          >
            <FontAwesomeIcon icon={showCheckboxes ? faCheckCircle : faCheckToSlot} />
            {showCheckboxes ? 'Batal Pilih' : 'Pilih Masal'}
          </button>
          {showCheckboxes && selectedAccounts.length > 0 && (
            <button className="flex items-center text-nowrap gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium" onClick={handleMassDelete}>
              <FontAwesomeIcon icon={faTrash} />
              Hapus Terpilih ({selectedAccounts.length})
            </button>
          )}
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
            {/* <select className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Semua</option>
              <option>IT</option>
              <option>HRD</option>
              <option>Finance</option>
              <option>Marketing</option>
            </select> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {showCheckboxes && (
                  <th className="px-6 py-3 text-left w-16">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={selectedAccounts.length > 0 && selectedAccounts.length === Karyawan.filter(k => k.id !== 1).length}
                    />
                  </th>
                )}
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
                <tr key={k.id as number} className={`hover:bg-gray-50 ${showCheckboxes && selectedAccounts.includes(k.id) ? 'bg-blue-50' : ''}`}>
                  {showCheckboxes && (
                    <td className="px-6 py-4">
                      {k.id !== 1 && (
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          checked={selectedAccounts.includes(k.id)}
                          onChange={(e) => handleSelectOne(e, k.id)}
                        />
                      )}
                    </td>
                  )}
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
