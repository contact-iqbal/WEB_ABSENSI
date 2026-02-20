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

  useEffect(() => {
    getabsensi();
    console.log(filterDate)
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
  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Absensi</h1>
          <p className="text-gray-600 mt-1">Kelola absensi karyawan</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faFileImport} />
            Import Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <FontAwesomeIcon icon={faPlus} />
            Catat Absensi
          </button>
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
          <div className="flex items-center gap-4">
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
                absensi.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString("id-ID").replaceAll('/','-')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{item.nama}</p>
                      <p className="text-xs text-gray-600">{item.jabatan}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.absen_masuk
                        ? item.absen_masuk.substring(0, 5)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.absen_keluar
                        ? item.absen_keluar.substring(0, 5)
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          item.status === "hadir"
                            ? "bg-green-100 text-green-700"
                            : item.status === "terlambat"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.status === "izin"
                                ? "bg-blue-100 text-blue-700"
                                : item.status === "sakit"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.keterangan || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
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
