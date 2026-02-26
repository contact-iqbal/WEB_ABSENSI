'use client'
import { showError, showInfo, showSuccess, showWarning } from "@/lib/sweetalert";
import { faTrash, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface config {
  nama_perusahaan: String,
  alamat_perusahaan?: any,
  no_telp_perusahaan?: any,
  email_perusahaan?: any,
  jam_masuk?: any,
  jam_pulang?: any,
  toleransi_telat?: any,
  tunjangan_transport?: any,
  tunjangan_makan?: any,
  potongan_alpha?: any,
  potongan_terlambat?: any,
  toleransi_potongan_terlambat?: any,
  upah_lembur?: any
}
export default function PengaturanPage() {
  const [section, Setsection] = useState<Number | null>(1)
  const [configdata, Setconfigdata] = useState<config | null>(null)
  const [pendingUpdate, SetpendingUpdate] = useState<config>({
    nama_perusahaan: '',
    alamat_perusahaan: '',
    no_telp_perusahaan: '',
    email_perusahaan: '',
    jam_masuk: 0,
    jam_pulang: 0,
    toleransi_telat: 0,
    tunjangan_transport: 0,
    tunjangan_makan: 0,
    potongan_alpha: 0,
    potongan_terlambat: 0,
    toleransi_potongan_terlambat: 0,
    upah_lembur: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setuploaded] = useState<{ file: File | null, fileName: string, isuploaded: boolean }>({ file: null, fileName: '', isuploaded: false });
  const isitchanged = configdata != null && configdata !== pendingUpdate || uploaded.isuploaded === true

  const items = [
    {
      section: 'Umum'
    },
    {
      section: 'Jam Kerja'
    },
    {
      section: 'Gaji & Tunjangan'
    },
    {
      section: 'Backup & Restore',
    },
  ]
  useEffect(() => {
    fetchconfig()
  }, [])

  const fetchconfig = async () => {
    const configdatas = await fetch('/api/admin/config')
    const configresult = await configdatas.json()

    if (configresult.success) {
      Setconfigdata(configresult.result[0])
      SetpendingUpdate(configresult.result[0])
    }
  }
  const sendupdate = async () => {
    const configupdate = await fetch('/api/admin/config', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...pendingUpdate,
      }),
    })
    const configupdateresult = await configupdate.json()
    if (configupdateresult.success) {
      showSuccess('Sukses', configupdateresult.message)
      fetchconfig()
    }
  }

  const downloadBackup = async () => {
    const res = await fetch('/api/admin/database_export', {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
      },
    });

    if (!res.ok) {
      alert('Backup failed');
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${Date.now().toString()}.sql`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };
  const handlechangefile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setuploaded({ file: file, fileName: file.name, isuploaded: true });
    }
  }
  const importfromsql = async () => {
    const file = uploaded.file
    if (!file) return

    if (!file.name.endsWith(".sql")) {
      showWarning('Not allowed',"Hanya file .sql yang diperbolehkan");
      return;
    }
    const formdata = new FormData()
    formdata.append('sqlFile', file)
    const waitresult = await fetch('/api/admin/config/import_sql', {
      method: 'POST',
      body: formdata
    })
    const actualresult = await waitresult.json()
    if (actualresult.success) {
      showSuccess('Sukess', 'Database telah sukses diganti dari file!')
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setuploaded({ file: null, fileName: '', isuploaded: false });
    } else {
      showError('Gagal', 'Cek konsol')
    }
  }


  return (
    <div className="space-y-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Kelola pengaturan sistem absensi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-1">
              {items.map((itm, index) => (
                <button key={index + 1} className={`w-full text-left px-4 py-3 cursor-pointer ${section === index + 1 ? 'bg-blue-50 text-blue-700 rounded-lg font-medium' : 'text-gray-700 hover:bg-gray-50 rounded-lg'}`} onClick={() => (Setsection(index + 1))}>
                  {itm.section}
                </button>
              ))}
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
                    defaultValue={String(configdata?.nama_perusahaan ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        nama_perusahaan: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Perusahaan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan alamat perusahaan"
                    defaultValue={String(configdata?.alamat_perusahaan ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        alamat_perusahaan: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      defaultValue={String(configdata?.no_telp_perusahaan ?? '')}
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                          "Ctrl",
                          "Shift"
                        ];

                        if (
                          allowedKeys.includes(e.key) ||
                          /^[0-9-+]$/.test(e.key)
                        ) {
                          return;
                        }

                        e.preventDefault();
                      }}
                      onChange={(e) =>
                        SetpendingUpdate(prev => ({
                          ...prev,
                          no_telp_perusahaan: e.target.value.replace(/[^0-9+]/g, '')
                        }))
                      }
                      className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Email perusahaan"
                      defaultValue={String(configdata?.email_perusahaan ?? '')}
                      onChange={(e) =>
                        SetpendingUpdate(prev => ({
                          ...prev,
                          email_perusahaan: e.target.value
                        }))
                      }
                      className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      defaultValue={String(configdata?.jam_masuk ?? '')}
                      onChange={(e) =>
                        SetpendingUpdate(prev => ({
                          ...prev,
                          jam_masuk: e.target.value + ':00'
                        }))
                      }
                      className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Pulang
                    </label>
                    <input
                      type="time"
                      defaultValue={String(configdata?.jam_pulang ?? '')}
                      onChange={(e) =>
                        SetpendingUpdate(prev => ({
                          ...prev,
                          jam_pulang: e.target.value + ':00'
                        }))
                      }
                      className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toleransi Keterlambatan (menit)
                  </label>
                  <input
                    type="number"
                    defaultValue={String(configdata?.toleransi_telat ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        toleransi_telat: e.target.value
                      }))
                    }
                    className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="weekend"
                    className="w-4 h-4 text-blue-600 text-gray-700 border-gray-300 rounded focus:ring-blue-500"
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
                Komponen Tunjangan
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
                    defaultValue={Number(configdata?.tunjangan_transport ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        tunjangan_transport: e.target.value
                      }))
                    }
                    className="w-32 px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    defaultValue={Number(configdata?.tunjangan_makan ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        tunjangan_makan: e.target.value
                      }))
                    }
                    className="w-32 px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Komponen Gaji
                </h3>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Potongan Alpha</p>
                    <p className="text-sm text-gray-600">Per hari</p>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    defaultValue={Number(configdata?.potongan_alpha ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        potongan_alpha: e.target.value
                      }))
                    }
                    className="w-32 px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Potongan Terlambat</p>
                    <p className="text-sm text-gray-600">Per Menit</p>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    defaultValue={Number(configdata?.potongan_terlambat ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        potongan_terlambat: e.target.value
                      }))
                    }
                    className="w-32 px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Toleransi potongan terlambat</p>
                    <p className="text-sm text-gray-600">Dalam Persen</p>
                  </div>
                  <div className="flex flex-row w-32 justify-items-center items-center gap-1">
                    <input
                      type="number"
                      placeholder="0"
                      defaultValue={Number(configdata?.toleransi_potongan_terlambat ?? '')}
                      onChange={(e) =>
                        SetpendingUpdate(prev => ({
                          ...prev,
                          toleransi_potongan_terlambat: e.target.value
                        }))
                      }
                      className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-black">%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Upah Lembur</p>
                    <p className="text-sm text-gray-600">Per Jam</p>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    defaultValue={Number(configdata?.upah_lembur ?? '')}
                    onChange={(e) =>
                      SetpendingUpdate(prev => ({
                        ...prev,
                        upah_lembur: e.target.value
                      }))
                    }
                    className="w-32 px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          }
          {section == 4 &&
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Pengaturan Database
              </h3>

              <div className="space-y-4 grid grid-cols-2 gap-4 justify-end justify-items-end">
                <div className="w-full text-black">
                  <h5>Import</h5>
                  <input type="file" className="hidden" title="Upload" accept=".sql" ref={fileInputRef} onChange={handlechangefile} />
                  <div className="relative flex flex-row">
                    <button className={`w-full px-6 py-2 border border-gray-300 text-gray-700 ${uploaded.isuploaded ? "rounded-tl-lg rounded-bl-lg" : "rounded-lg"} hover:bg-gray-50 transition-colors font-medium`} onClick={() => {
                      fileInputRef.current?.click();
                    }}>
                      {uploaded.isuploaded ? 'Import Ulang' : 'Import'}
                    </button>
                    {uploaded.isuploaded ? (
                      <>
                        <p className="absolute top-10 left-0">{uploaded.fileName}</p>
                        <button className={`w-fit bg-red-500 hover:bg-red-700 ${uploaded.isuploaded ? "rounded-tr-lg rounded-br-lg" : ""} text-white px-3 py-2`} onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                          setuploaded({ file: null, fileName: '', isuploaded: false });
                        }}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </>
                    ) : ''}

                  </div>
                </div>
                <div className="w-full text-black">
                  <h5>Export</h5>
                  <button className="px-6 py-2 w-full border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" onClick={downloadBackup}>
                    Export
                  </button>
                </div>
              </div>
            </div>
          }
          {uploaded.isuploaded ?
            <p className="text-black bg-yellow-100/90 py-2 px-4 rounded-lg">
              <FontAwesomeIcon icon={faWarning} className="text-neutral-700" />
              Tekan "Simpan Perubahan" untuk mengganti database dengan file yang di upload
            </p>
            :
            ''
          }
          <div className="flex justify-end gap-3">
            {isitchanged ?
              <>
                {isitchanged && uploaded.isuploaded != true ?
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    onClick={() => (fetchconfig())}
                  >
                    Batal
                  </button>
                  :
                  ''
                }

                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => {
                    if (uploaded.isuploaded) {
                      importfromsql()
                    } else {
                      sendupdate()
                    }
                  }}
                >
                  Simpan Perubahan
                </button>
              </>
              :
              ''
            }
          </div>
        </div>
      </div>
    </div>
  );
}
