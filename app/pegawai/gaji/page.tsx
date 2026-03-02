'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faDownload, faEye, faCalendar, faEyeLowVision, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, ChangeEvent } from 'react';

interface Gaji {
  karyawan_id: any;
  id: number;
  bulan: number;
  tahun: number;
  gaji_pokok: number;
  total_tunjangan: number;
  total_potongan: number;
  gaji_bersih: number;
  status_bayar: string;
  tanggal_bayar: string;
  detail_tunjangan: string;
  detail_potongan: string;
}

export default function GajiPegawaiPage() {
  const [gajiHistory, setGajiHistory] = useState<Gaji[]>([]);
  const [currentGaji, setCurrentGaji] = useState<Gaji | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiddengaji, sethiddengaji] = useState(true);
  const [selectedgaji, setselectedgaji] = useState<Number[]>([]);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [session, setsession] = useState<{ userId: number, username: string }>({ userId: 0, username: '' })

  useEffect(() => {
    const fetchGaji = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        setsession(session)
        console.log(session)

        if (session.success) {
          const res = await fetch(`/api/karyawan/gaji?karyawan_id=${session.userId}`);
          const data = await res.json();
          if (data.success) {
            setGajiHistory(data.result.history);
            setCurrentGaji(data.result.current);
          }
        }
      } catch (error) {
        console.error('Error fetching salary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGaji();
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBulanName = (bulan: number) => {
    const names = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return names[bulan - 1];
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = gajiHistory.map(k => k.id);
      setselectedgaji(allIds);
    } else {
      setselectedgaji([]);
    }
  };
  const handleSelectOne = (e: ChangeEvent<HTMLInputElement>, id: Number) => {
    if (e.target.checked) {
      setselectedgaji(prev => [...prev, id]);
    } else {
      setselectedgaji(prev => prev.filter(selectedId => selectedId !== id));
    }
  };
  useEffect(() => {
    console.log(selectedgaji)
  }, [selectedgaji])

  const handlePrintSelected = async () => {
    const selectedData = gajiHistory.filter(item => selectedgaji.includes(item.id));
    if (selectedData.length === 0) return;
    const getkaryawandevisi = await fetch('/api/karyawan/personal_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.userId })
    })
    const resultdevisi = await getkaryawandevisi.json()
    const devisi = resultdevisi.result[0].devisi

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const html = `
      <html>
        <head>
          <title>Slip Gaji</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; font-size: 20px }
            .slip-item { margin-bottom: 40px; page-break-inside: avoid; }
            @media print {
              .slip-item { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Slip Gaji</h1>
          ${devisi === 'DNA' ? '<img src="https://res.cloudinary.com/dnajayagroup/image/upload/v1772425085/x2tvyzvmsm7i44rxhwgr.png" width="300" height="104"/>' : devisi === 'RT' ? '<img src="https://res.cloudinary.com/dnajayagroup/image/upload/v1772425086/um69jkknws3jcu6crvwv.png" width="300" height="104"/>' : ''}
          <p>Karyawan: ${resultdevisi.result[0].nama ? resultdevisi.result[0].nama : session.username}</p>
          ${selectedData.map(item => `
            <div class="slip-item">
              <h3>Periode: ${getBulanName(item.bulan)} ${item.tahun}</h3>
              <table>
                <tr><th>Keterangan</th><th>Jumlah</th></tr>
                <tr><td>Gaji Pokok</td><td>${formatRupiah(Number(item.gaji_pokok))}</td></tr>
                <tr><td>Total Tunjangan</td><td>${formatRupiah(Number(item.total_tunjangan))}</td></tr>
                <tr><td>Total Potongan</td><td>${formatRupiah(Number(item.total_potongan))}</td></tr>
                <tr style="font-weight: bold;"><td>Gaji Bersih</td><td>${formatRupiah(Number(item.gaji_bersih))}</td></tr>
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    // Trigger print after content is loaded
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Cleanup: remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className='md:pt-12'>
        <h1 className="text-2xl font-bold text-gray-800">Slip Gaji</h1>
        <p className="text-gray-600 mt-1">Lihat rincian gaji dan riwayat pembayaran</p>
      </div>

      {currentGaji ? (
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-green-100 mb-2">Gaji Bulan Ini</p>
              <h2 className="text-4xl font-bold">{hiddengaji ? '...' : formatRupiah(Number(currentGaji.gaji_bersih))}</h2>
              <p className="text-green-100 mt-2">{getBulanName(currentGaji.bulan)} {currentGaji.tahun}</p>
            </div>
            <button className="w-20 h-20 bg-white bg-opacity-20 hover:bg-neutral-200 rounded-full flex items-center justify-center"
              onClick={() => { sethiddengaji(!hiddengaji) }}
            >
              <FontAwesomeIcon icon={hiddengaji ? faEye : faEyeSlash} className="text-4xl text-green-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-green-400">
            <div>
              <p className="text-green-100 text-sm">Gaji Pokok</p>
              <p className="text-xl font-bold mt-1">{hiddengaji ? '...' : formatRupiah(Number(currentGaji.gaji_pokok))}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Tunjangan</p>
              <p className="text-xl font-bold mt-1">+ {hiddengaji ? '...' : formatRupiah(Number(currentGaji.total_tunjangan))}</p>
            </div>
            <div>
              <p className="text-green-100 text-sm">Potongan</p>
              <p className="text-xl font-bold mt-1">- {hiddengaji ? '...' : formatRupiah(Number(currentGaji.total_potongan))}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
          Gaji bulan ini belum tersedia.
        </div>
      )}

      {currentGaji && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Rincian Gaji Bulan Ini</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Pendapatan</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Gaji Pokok</span>
                  <span className="font-semibold text-gray-800">{hiddengaji ? '...' : formatRupiah(Number(currentGaji.gaji_pokok))}</span>
                </div>
                {currentGaji.detail_tunjangan && currentGaji.detail_tunjangan.split(', ').map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">{d.split(': ')[0]}</span>
                    <span className="font-semibold text-gray-800">{hiddengaji ? '...' : d.split(': ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Potongan</h4>
              <div className="space-y-2">
                {currentGaji.detail_potongan ? (
                  currentGaji.detail_potongan.split(', ').map((d, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">{d.split(': ')[0]}</span>
                      <span className="font-semibold text-red-600">-{hiddengaji ? '...' : d.split(': ')[1]}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Tidak ada potongan</span>
                    {/* <span className="font-semibold text-green-600">Rp 0</span> */}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-lg font-bold text-gray-800">Total Gaji Bersih</span>
                <span className="text-2xl font-bold text-green-600">{hiddengaji ? '...' : formatRupiah(Number(currentGaji.gaji_bersih))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Riwayat Pembayaran Gaji</h3>
            <div className="flex gap-2">
              {showCheckboxes && selectedgaji.length > 0 && (
                <button
                  className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors'
                  onClick={handlePrintSelected}
                >Cetak ({selectedgaji.length})</button>
              )}
              <button className='bg-blue-500 text-white px-4 py-2 rounded-lg'
                onClick={() => {
                  setShowCheckboxes(!showCheckboxes);
                  if (showCheckboxes) setselectedgaji([]);
                }}
              >{showCheckboxes ? 'Batal Export' : 'Export Gaji'}</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {showCheckboxes && (
                  <th className="px-6 py-3 text-left w-16">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={selectedgaji.length > 0 && selectedgaji.length === gajiHistory.length}
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Periode
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
                  Total
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gajiHistory.map((item) => (
                <tr key={item.id as number} className="hover:bg-gray-50">
                  {showCheckboxes && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        checked={selectedgaji.includes(item.id)}
                        onChange={(e) => handleSelectOne(e, item.id)}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{getBulanName(item.bulan)} {item.tahun}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{hiddengaji ? '...' : formatRupiah(Number(item.gaji_pokok))}</td>
                  <td className="px-6 py-4 text-green-600">{hiddengaji ? '...' : formatRupiah(Number(item.total_tunjangan))}</td>
                  <td className="px-6 py-4 text-red-600">{hiddengaji ? '...' : formatRupiah(Number(item.total_potongan))}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{hiddengaji ? '...' : formatRupiah(Number(item.gaji_bersih))}</p>
                  </td>
                  {/* <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${item.status_bayar === 'sudah_dibayar' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-xs font-semibold rounded-full capitalize whitespace-nowrap`}>
                      {item.status_bayar.replace('_', ' ')}
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
