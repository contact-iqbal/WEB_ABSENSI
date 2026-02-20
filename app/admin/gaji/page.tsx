"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { showError, showSuccess, showToast } from "@/lib/sweetalert";

interface Gaji {
  id: number;
  karyawan_id: number;
  nama: string;
  jabatan: string;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  total_tunjangan: number;
  total_potongan: number;
  gaji_bersih: number;
  status_bayar: string;
  tanggal_bayar: string;
}

interface Stats {
  total_gaji: number;
  sudah_dibayar: number;
  belum_dibayar: number;
  total_potongan: number;
}

export default function GajiPage() {
  const [gajiList, setGajiList] = useState<Gaji[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_gaji: 0,
    sudah_dibayar: 0,
    belum_dibayar: 0,
    total_potongan: 0,
  });
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [iscalculated, setcalculated] = useState(false)

  useEffect(() => {
    fetchGaji();
  }, [bulan, tahun, filterStatus, searchTerm]);

  const fetchGaji = async () => {
    const params = new URLSearchParams();
    params.append("bulan", bulan.toString());
    params.append("tahun", tahun.toString());
    if (filterStatus !== "Semua Status")
      params.append(
        "status",
        filterStatus === "Sudah Dibayar" ? "sudah_dibayar" : "belum_dibayar",
      );
    if (searchTerm) params.append("search", searchTerm);

    const response = await fetch(`/api/admin/gaji?${params.toString()}`);
    const result = await response.json();
    if (result.success) {
      setGajiList(result.result);
      setStats(result.stats);
      setcalculated(result.iscalculated)
    }
  };

  const handleHitungOtomatis = async () => {
    try {
      const response = await fetch("/api/admin/gaji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "hitung_otomatis",
          bulan,
          tahun,
        }),
      });

      const result = await response.json();
      if (result.success) {
        showToast("Sukses", 'success');
        fetchGaji();
      } else {
        await showError("Error", result.message);
      }
    } catch (e) {
      await showError("Error", "Terjadi kesalahan saat menghitung gaji");
    }
  };

  const handleBayar = async (id: number) => {
    try {
      const response = await fetch("/api/admin/gaji", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status_bayar: "sudah_dibayar",
          tanggal_bayar: new Date().toISOString().split("T")[0],
        }),
      });

      const result = await response.json();
      if (result.success) {
        await showSuccess("Sukses", "Gaji berhasil dibayar");
        fetchGaji();
      }
    } catch (e) {
      await showError("Error", "Terjadi kesalahan");
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const bulanNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Penggajian</h1>
          <p className="text-gray-600 mt-1">
            Kelola gaji dan pembayaran karyawan
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleHitungOtomatis}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FontAwesomeIcon icon={faSync} />
            {iscalculated ? 'Hitung ulang' : 'Hitung Otomatis'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">
            Total Gaji Bulan Ini
          </p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">
            {formatRupiah(stats.total_gaji)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {gajiList.length} karyawan
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Sudah Dibayar</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            {formatRupiah(stats.sudah_dibayar)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {gajiList.filter((g) => g.status_bayar === "sudah_dibayar").length}{" "}
            karyawan
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Belum Dibayar</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">
            {formatRupiah(stats.belum_dibayar)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {gajiList.filter((g) => g.status_bayar === "belum_dibayar").length}{" "}
            karyawan
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Potongan</p>
          <h3 className="text-2xl font-bold text-yellow-600 mt-2">
            {formatRupiah(stats.total_potongan)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Total potongan</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {bulanNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {name} {tahun}
                </option>
              ))}
            </select>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Semua Status</option>
              <option>Sudah Dibayar</option>
              <option>Belum Dibayar</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Karyawan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Gaji Pokok
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tunjangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Potongan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Gaji
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
              {gajiList.length > 0 ? (
                gajiList.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{item.nama}</p>
                      <p className="text-sm text-gray-600">{item.jabatan}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatRupiah(item.gaji_pokok)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatRupiah(item.total_tunjangan)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatRupiah(item.total_potongan)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {formatRupiah(item.gaji_bersih)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${item.status_bayar === "sudah_dibayar"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {item.status_bayar === "sudah_dibayar"
                          ? "Sudah Dibayar"
                          : "Belum Dibayar"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.status_bayar === "belum_dibayar" && (
                        <button
                          onClick={() => handleBayar(item.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada data penggajian. Silakan hitung gaji otomatis
                    berdasarkan absensi.
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
