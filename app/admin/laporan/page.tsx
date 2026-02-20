'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faMoneyBillWave, faUsers, faFileExport, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { showSuccess, showError } from '@/lib/sweetalert';

export default function LaporanPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('absensi');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportType, bulan: month, tahun: year })
      });
      const result = await res.json();

      if (result.success && result.data.length > 0) {
        // Format data before export
        const formattedData = result.data.map((item: any) => {
          const newItem = { ...item };
          
          // 1. Format Dates
          const dateFields = ['tanggal', 'tanggal_bayar', 'tanggal_bergabung', 'acc_created', 'tanggal_lahir'];
          dateFields.forEach(field => {
            if (newItem[field]) {
              newItem[field] = new Date(newItem[field]).toLocaleDateString('id-ID');
            }
          });

          // 2. Format Currency (integers to Rp)
          const moneyFields = ['gaji_pokok', 'total_tunjangan', 'total_potongan', 'gaji_bersih'];
          moneyFields.forEach(field => {
            if (newItem[field] !== undefined) {
              newItem[field] = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(Number(newItem[field]));
            }
          });

          // 3. Fix NIK (force string to prevent scientific notation)
          if (newItem.NIK) {
            newItem.NIK = `NIK:${newItem.NIK}`; // Prepend space or use string conversion
          }

          return newItem;
        });

        const ws = XLSX.utils.json_to_sheet(formattedData);

        // 4. Auto-calculate column widths
        const colWidths = Object.keys(formattedData[0]).map(key => {
          const headerLen = key.length;
          const maxContentLen = Math.max(
            ...formattedData.map((row: any) => String(row[key] || '').length)
          );
          return { wch: Math.max(headerLen, maxContentLen) + 2 };
        });
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan");
        
        const fileName = `Laporan_${reportType}_${month}-${year}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        showSuccess('Berhasil', `Laporan berhasil di-download`);
      } else {
        showError('Gagal', 'Tidak ada data untuk periode ini');
      }
    } catch (error) {
      showError('Error', 'Terjadi kesalahan saat generate laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
        <p className="text-gray-600 mt-1">Export laporan ke format Excel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setReportType('absensi')}
          className={`cursor-pointer rounded-lg shadow-md p-6 border-l-4 transition-all ${reportType === 'absensi' ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-200' : 'bg-white border-blue-600 hover:shadow-lg'}`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faChartBar} className="text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Laporan Absensi</h3>
              <p className="text-sm text-gray-600 mt-1">Rekap kehadiran bulanan</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setReportType('gaji')}
          className={`cursor-pointer rounded-lg shadow-md p-6 border-l-4 transition-all ${reportType === 'gaji' ? 'bg-green-50 border-green-600 ring-2 ring-green-200' : 'bg-white border-green-600 hover:shadow-lg'}`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faMoneyBillWave} className="text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Laporan Gaji</h3>
              <p className="text-sm text-gray-600 mt-1">Rekap penggajian bulanan</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setReportType('karyawan')}
          className={`cursor-pointer rounded-lg shadow-md p-6 border-l-4 transition-all ${reportType === 'karyawan' ? 'bg-orange-50 border-orange-600 ring-2 ring-orange-200' : 'bg-white border-orange-600 hover:shadow-lg'}`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center text-orange-600">
              <FontAwesomeIcon icon={faUsers} className="text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Data Karyawan</h3>
              <p className="text-sm text-gray-600 mt-1">Export seluruh data karyawan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-4">Konfigurasi Export</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <select 
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={reportType === 'karyawan'}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select 
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={reportType === 'karyawan'}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleExport}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFileExport} />
              Download Excel
            </>
          )}
        </button>
      </div>
    </div>
  );
}
