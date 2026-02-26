"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileImport,
  faPlus,
  faCheck,
  faClock,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import pool from "@/lib/db";
import { showError, showInfo, showSuccess } from "@/lib/sweetalert";
import { formatdateyyyymmdd } from "@/lib/aliases";

interface absen {
  id: number;
  nama: string;
  jabatan: string;
  tanggal: string;
  absen_masuk: string;
  absen_keluar: string;
  status: string;
  keterangan: string;
}

interface stats {
  hadir: number;
  terlambat: number;
  tidak_hadir: number;
}

interface akun {
  id: number;
  nama: string;
}

export default function AbsensiPage() {
  const [absensi, setabsensi] = useState<absen[]>([]);
  const [stats, setStats] = useState<stats>({
    hadir: 0,
    terlambat: 0,
    tidak_hadir: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [showModal, setShowModal] = useState(false);
  const [akunkaryawan, setakunkaryawan] = useState<akun[]>([]);
  const [absenupdate, setabsenupdate] = useState({
    karyawan_id: 0,
    status: 'hadir',
    tanggal: '',
    absen_masuk: '',
    absen_keluar: '',
    keterangan: null,
    override: ''
  })
  const [editing, Setediting] = useState<null | Number>(0);
  const [updateabsen, setupdateabsen] = useState({
    id: 0,
    absen_masuk: '',
    absen_keluar: '',
    status: '',
    keterangan: '',
    tanggal: ''
  })
  const handleEditSave = (k: any) => {
    if (editing === k.id) {
      if (k.id != updateabsen.id || k.absen_masuk != updateabsen.absen_masuk || k.absen_keluar != updateabsen.absen_keluar || k.status != updateabsen.status) {
        sendtheupdate(updateabsen)
      }
      Setediting(null)
      getabsensi()
    } else {
      Setediting(k.id)
      setupdateabsen({
        id: k.id,
        absen_masuk: k.absen_masuk,
        absen_keluar: k.absen_keluar,
        status: k.status,
        keterangan: k.keterangan,
        tanggal: formatdateyyyymmdd(k.tanggal)
      })
    }
  }
  //absen_masuk, absen_keluar, status, keterangan, karyawan_id, tanggal
  const sendtheupdate = async (update: any) => {
    const updatestuff = await fetch('/api/admin/absensi', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        karyawan_id: update.id,
        absen_masuk: update.absen_masuk,
        absen_keluar: update.absen_keluar,
        status: update.status,
        keterangan: update.keterangan,
        tanggal: update.tanggal
      })
    });
    const resultupdate = await updatestuff.json()
    if (resultupdate.success) {
      await showSuccess("Sukses", `${resultupdate.message}`)
    } else if (!resultupdate.success == false && !resultupdate.error) {
      await showInfo("Huh?", `${resultupdate.message || resultupdate.error || resultupdate.toString()}`)
    }
  }

  useEffect(() => {
    getabsensi();
    akun();
  }, [filterDate, filterStatus, searchTerm]);

  const getabsensi = async () => {
    const params = new URLSearchParams();
    if (filterDate) params.append("tanggal", filterDate);
    if (filterStatus !== "Semua Status") params.append("status", filterStatus);
    if (searchTerm) params.append("search", searchTerm);

    const absensirslt = await fetch(`/api/admin/absensi?${params.toString()}`);
    const absensiresult = await absensirslt.json();
    if (absensiresult.success) {
      setabsensi(absensiresult.result);
      setStats(absensiresult.stats);
    }
  };
  const akun = async () => {
    const fetchakun = await fetch('/api/admin/karyawan')
    const resultakun = await fetchakun.json();
    if (resultakun.success) {
      setakunkaryawan(resultakun.result)
    }
  }

  const handleaddabsen = async () => {
    if (absenupdate.karyawan_id === 0 || !absenupdate.status || !absenupdate.tanggal || !absenupdate.absen_masuk) {
      await showError('Error', 'karyawan, tanggal, dan status harus terpilih!')
      return
    }
    try {
      const created_at = `${absenupdate.tanggal} ${absenupdate.absen_masuk}:00`
      const response = await fetch("/api/admin/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...absenupdate, override: created_at
        }),
      });

      const result = await response.json();
      if (result.success) {
        showSuccess('Sukess', result.message)
        setShowModal(false)
        setabsenupdate({
          karyawan_id: 0,
          status: 'hadir',
          tanggal: '',
          absen_masuk: '',
          absen_keluar: '',
          keterangan: null,
          override: ''
        })
        getabsensi()
      } else {
        showError('Error', result.message)
      }
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => (
    console.log(updateabsen)
  ), [updateabsen])
  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Absensi</h1>
          <p className="text-gray-600 mt-1">Kelola absensi karyawan</p>
        </div>
        <div className="flex gap-3">
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faFileImport} />
            Import Excel
          </button> */}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => (setShowModal(true))}
          >
            <FontAwesomeIcon icon={faPlus} />
            Catat Absensi
          </button>
        </div>
      </div>
      <div className={`fixed inset-0 w-full h-full bg-black bg-black/50 flex items-center justify-center z-50 transition-all ${showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Tambah Rekap Absensi Baru
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Karyawan
              </label>
              <select
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setabsenupdate({
                  ...absenupdate, karyawan_id: Number(e.target.value)
                })}
                value={absenupdate.karyawan_id}
              >
                <option value="0" hidden>-</option>
                {akunkaryawan.map((akunkaryawan) => (
                  <option key={akunkaryawan.id} value={akunkaryawan.id}>id:{akunkaryawan.id}, {akunkaryawan.nama} </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input type="date" name="tanggal_absen" id="tanggal_absen" className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setabsenupdate({
                  ...absenupdate, tanggal: e.target.value
                })}
                value={absenupdate.tanggal}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam Masuk
              </label>
              <input type="time" className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setabsenupdate({
                  ...absenupdate, absen_masuk: e.target.value
                })}
                value={absenupdate.absen_masuk}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam Keluar
              </label>
              <input type="time" className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setabsenupdate({
                  ...absenupdate, absen_keluar: e.target.value
                })}
                value={absenupdate.absen_keluar}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                onChange={(e) => setabsenupdate({
                  ...absenupdate, status: e.target.value
                })}
                value={absenupdate.status}
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hadir">Hadir</option>
                <option value="terlambat">Terlambat</option>
                <option value="alpha">Alpha</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
              </select>
            </div>

          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowModal(false);

              }}
              className="flex-1 px-4 py-2 bg-red-500 border border-gray-300 text-gray-700 rounded-lg hover:bg-red-600 transition-colors font-medium text-white"
            >
              Batal
            </button>
            <button
              onClick={handleaddabsen}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faCheck} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Hadir tepat waktu</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.hadir}
              </h3>
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
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.terlambat}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center text-red-600">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Tidak Hadir</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.tidak_hadir}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Semua Status</option>
              <option>Hadir</option>
              <option>Terlambat</option>
              <option>Izin</option>
              <option>Cuti</option>
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
                  Nama Karyawan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jam Masuk
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Jam Keluar
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {absensi.length > 0 ? (
                absensi.map((item, index) => {
                  const isEditing = editing == item.id
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                        {new Date(item.tanggal).toLocaleDateString("id-ID").replaceAll('/', '-')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{item.nama}</p>
                        <p className="text-xs text-gray-600">{item.jabatan}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditing ?
                          <input type="time" defaultValue={updateabsen.absen_masuk} className="px-4 py-2 text-black border border-2 rounded-lg"
                            onChange={(e) => { setupdateabsen({ ...updateabsen, absen_masuk: e.target.value + ':00' }) }}
                          />
                          :
                          <p>{item.absen_masuk
                            ? item.absen_masuk.substring(0, 5)
                            : "-"}</p>
                        }

                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {isEditing ?
                          <input type="time" defaultValue={updateabsen.absen_keluar} className="px-4 py-2 text-black border border-2 rounded-lg"
                            onChange={(e) => { setupdateabsen({ ...updateabsen, absen_keluar: e.target.value + ':00' }) }}
                          />
                          :
                          <p>{item.absen_keluar
                            ? item.absen_keluar.substring(0, 5)
                            : "-"}</p>
                        }

                      </td>
                      <td className="px-6 py-4">
                        {isEditing ?
                          <select name="status" id="status" defaultValue={updateabsen.status} className="px-4 py-2 text-black border border-2 rounded-lg"
                            onChange={(e) => { setupdateabsen({ ...updateabsen, status: e.target.value }) }}
                          >
                            <option value="hadir">Hadir</option>
                            <option value="terlambat">Terlambat</option>
                            <option value='izin'>Izin</option>
                            <option value='cuti'>Cuti</option>
                            <option value='sakit'>Sakit</option>
                            <option value='alpha'>Alpha</option>
                          </select>
                          :
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${item.status === "hadir"
                              ? "bg-green-100 text-green-700"
                              : item.status === "terlambat"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.status === "izin"
                                  ? "bg-blue-100 text-blue-700"
                                  : item.status === "sakit"
                                    ? "bg-orange-100 text-orange-700"
                                    : item.status === "cuti"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </span>
                        }

                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.keterangan || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-neutral-100 bg-blue-600 px-4 py-2 hover:bg-blue-500 rounded-lg font-medium text-sm transition"
                          onClick={() => (handleEditSave(item))}
                        >
                          {isEditing ? 'Save' : 'Edit'}
                        </button>
                      </td>
                    </tr>)
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada data absensi. Silakan catat absensi atau import
                    dari Excel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
