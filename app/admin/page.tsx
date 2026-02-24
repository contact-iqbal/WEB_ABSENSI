"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCheck,
  faTimes,
  faMoneyBillWave,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import pool from "@/lib/db";
import { useEffect, useState } from "react";

interface DataResult {
  karyawan: number;
  hadir_hari_ini: number;
  tidak_hadir_hari_ini: number;
  total_gaji_bulan_ini: number;
  absensi_terbaru: Array<{
    id: number;
    nama: string;
    jabatan: string;
    tanggal: string;
    absen_masuk: string;
    absen_keluar: string;
    status: string;
  }>;
  aktivitas_terkini: Array<{
    absen: Array<{
      tipe: string;
      nama: string;
      waktu: string;
      aktivitas: string;
    }>
    keluar: Array<{
      tipe: string;
      nama: string;
      waktu: string;
      aktivitas: string;
    }>
  }>;
}
export default function DashboardPage() {
  const [Data, SetData] = useState<DataResult | null>(null);
  const fetchdata = async () => {
    try {
      const rows = await fetch("/api/admin/data_summary");
      const result = await rows.json();
      SetData(result.result);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetchdata();
  }, []);
  const [authResult, setAuthResult] = useState<any>(null);
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();

      if (result.success) {
        setAuthResult(result);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats: Array<{
    title: string;
    value: string;
    icon: IconDefinition;
    bgColor: string;
    change: string;
  }> = [
      {
        title: "Total Karyawan",
        value: String(Data?.karyawan ?? 0),
        icon: faUsers,
        bgColor: "bg-neutral-500",
        change: "+0%",
      },
      {
        title: "Hadir Hari Ini",
        value: String(Data?.hadir_hari_ini ?? 0),
        icon: faCheck,
        bgColor: "bg-green-600",
        change: "0%",
      },
      {
        title: "Tidak Hadir Hari Ini",
        value: String(Data?.tidak_hadir_hari_ini ?? 0),
        icon: faTimes,
        bgColor: "bg-red-600",
        change: "0%",
      },
      {
        title: "Total Gaji Bulan Ini",
        value: authResult && authResult.accountAccess === 'hrd' ? '...' : formatRupiah(Data?.total_gaji_bulan_ini ?? 0) ,
        icon: faMoneyBillWave,
        bgColor: "bg-orange-400",
        change: "+0%",
      },
    ];

  return (
    <div className="space-y-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang di Sistem Absensi Karyawan
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {stat.value}
                </h3>
                <p className="text-xs text-green-900 mt-2">
                  {stat.change} dari bulan lalu
                </p>
              </div>
              <div
                className={`${stat.bgColor} hidden md:show w-14 h-14 rounded-full flex items-center justify-center text-white`}
              >
                <FontAwesomeIcon icon={stat.icon} className="text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Absensi Terbaru
          </h3>
          {Data?.absensi_terbaru && Data.absensi_terbaru.length > 0 ? (
            <div className="space-y-3">
              {Data.absensi_terbaru.map((absen, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{absen.nama}</p>
                    <p className="text-sm text-gray-600">{absen.jabatan}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(absen.tanggal).toLocaleDateString("id-ID")} -
                      {absen.absen_masuk
                        ? ` Masuk: ${absen.absen_masuk.substring(0, 5)}`
                        : ""}
                      {absen.absen_keluar
                        ? ` | Keluar: ${absen.absen_keluar.substring(0, 5)}`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${absen.status === "hadir"
                      ? "bg-green-100 text-green-700"
                      : absen.status === "terlambat"
                        ? "bg-yellow-100 text-yellow-700"
                        : absen.status === "izin"
                          ? "bg-blue-100 text-blue-700"
                          : absen.status === "sakit"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                      }`}
                  >
                    {absen.status.charAt(0).toUpperCase() +
                      absen.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Belum ada data absensi
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Aktivitas Terkini
          </h3>
          {Data?.aktivitas_terkini && Data.aktivitas_terkini.length > 0 ? (
            <div className="space-y-3">
              {Data?.aktivitas_terkini?.[0] &&
                [...Data.aktivitas_terkini[0].keluar,
                ...Data.aktivitas_terkini[0].absen]
                  .sort(
                    (a, b) =>
                      new Date(b.waktu).getTime() -
                      new Date(a.waktu).getTime()
                  ).slice(0, 5)
                  .map((aktivitas, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${aktivitas.tipe === "absensi"
                          ? "bg-green-500"
                          : "bg-blue-500"
                          }`}
                      ></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {aktivitas.nama}
                        </p>
                        <p className="text-sm text-gray-600">
                          {aktivitas.aktivitas}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(aktivitas.waktu).toLocaleString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Belum ada aktivitas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
