'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileAlt, faCheck, faClock, faTimes, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { showSuccess, showError, showConfirm } from '@/lib/sweetalert';

interface Izin {
  lembur_selesai: string;
  lembur_mulai: string;
  id: number;
  jenis_izin: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  created_at: string;
}

export default function IzinPage() {
  const [showForm, setShowForm] = useState(false);
  const [riwayatIzin, setRiwayatIzin] = useState<Izin[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingBukti, setExistingBukti] = useState('');

  // Form states
  const [jenisIzin, setJenisIzin] = useState('izin');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lemburMulai, setLemburMulai] = useState('');
  const [lemburSelesai, setLemburSelesai] = useState('');

  useEffect(() => {
    fetchSession();
  }, []);
  useEffect(() => {
    console.log(riwayatIzin)
  }, [riwayatIzin]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.success) {
        setUserId(data.userId);
        fetchRiwayat(data.userId);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchRiwayat = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/karyawan/izin?karyawan_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setRiwayatIzin(data.result);
      }
    } catch (error) {
      console.error('Error fetching riwayat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setIsEditing(true);
    setEditingId(item.id);
    setJenisIzin(item.jenis_izin);
    item.tanggal_mulai != null && item.tanggal_mulai != '' ? setTanggalMulai(item.tanggal_mulai.split('T')[0]) : setTanggalMulai('');
    item.tanggal_selesai != null && item.tanggal_selesai != '' ? setTanggalSelesai(item.tanggal_selesai.split('T')[0]) : setTanggalSelesai('');
    setLemburMulai(item.lembur_mulai);
    setLemburSelesai(item.lembur_selesai);
    setKeterangan(item.keterangan);
    setExistingBukti(item.bukti);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelIzin = async (id: number) => {
    const confirm = await showConfirm('Konfirmasi', 'Apakah Anda yakin ingin membatalkan pengajuan ini?');
    if (confirm.isConfirmed) {
      try {
        const res = await fetch('/api/karyawan/izin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'cancel' })
        });
        const data = await res.json();
        if (data.success) {
          showSuccess('Berhasil', 'Pengajuan telah dibatalkan');
          if (userId) fetchRiwayat(userId);
        } else {
          showError('Gagal', data.message);
        }
      } catch (error) {
        showError('Error', 'Terjadi kesalahan sistem');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Max 5MB check
      if (selectedFile.size > 5 * 1024 * 1024) {
        showError('Gagal', 'Ukuran file terlalu besar (Maksimal 5MB)');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: reader.result,
              folder: 'web_absensi/izin'
            })
          });
          const data = await res.json();
          if (data.success) {
            resolve(data.url);
          } else {
            reject(data.message);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    let tanggalMulaiRECON
    let tanggalSelesaiRECON

    if (tanggalMulai === '' || tanggalSelesai === '' || tanggalMulai === null || tanggalSelesai === null || jenisIzin === 'lembur') {
      tanggalMulaiRECON = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      tanggalSelesaiRECON = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      setTanggalMulai('')
      setTanggalSelesai('')
      // console.log('lembur masuk sini')
    } else {
      tanggalMulaiRECON = tanggalMulai
      tanggalSelesaiRECON = tanggalSelesai
      setLemburMulai('')
      setLemburSelesai('')
      // console.log('nggak lembur masuk sini')
    }
    const start = new Date(tanggalMulaiRECON);
    const end = new Date(tanggalSelesaiRECON);
    const currentYear = new Date().getFullYear();
    // console.log(jenisIzin)
    // console.log(tanggalMulai, tanggalSelesai)
    // console.log(tanggalMulaiRECON, tanggalSelesaiRECON)
    // console.log(start, end)
    // console.log(lemburMulai, lemburSelesai)

    if (start > end) {
      showError('Gagal', 'Tanggal mulai tidak boleh melebihi tanggal selesai');
      return;
    }

    if (start.getFullYear() !== currentYear || end.getFullYear() !== currentYear) {
      showError('Gagal', `Pengajuan hanya diperbolehkan untuk tahun ini (${currentYear})`);
      return;
    }

    // Check if trying to apply for today while already checked in
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const checkAbsen = await fetch('/api/karyawan/absen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, requests: 'fetch' })
      });

      const absenData = await checkAbsen.json();
      console.log(absenData);

      if (tanggalMulaiRECON === todayStr && !isEditing) {
        const todayLembur = riwayatIzin.find((item: any) => {
          const isLembur = item.jenis_izin?.toLowerCase() === 'lembur';

          const createdDate = new Date(item.created_at).toLocaleDateString('en-CA', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });

          const isToday = createdDate === todayStr;

          const notRejected = item.status?.toLowerCase() !== 'ditolak';

          return isLembur && isToday && notRejected;
        });

        // If already have lembur today → block
        if (todayLembur && jenisIzin?.toLowerCase() === 'lembur') {
          showError('Gagal', 'Anda sudah mengajukan lembur hari ini');
          return;
        }
        if (absenData.success) {

          const todayAbsen = absenData.result.find(
            (item: { tanggal: string | number | Date; status: string }) => {

              const itemDate = new Date(item.tanggal).toLocaleDateString('en-CA', {
                timeZone: 'Asia/Jakarta',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });

              return itemDate === todayStr;
            }
          );

          const blockedStatuses = ['izin', 'alpha', 'sakit', 'cuti'];
          const hadirStatuses = ['hadir', 'terlambat'];
          const allowedWithoutAbsen = ['cuti', 'izin', 'sakit'];

          const jenis = jenisIzin?.toLowerCase();

          // ga ada absen nya hari ini masuk sini
          if (!todayAbsen) {
            if (!allowedWithoutAbsen.includes(jenis)) {
              showError('Gagal', 'Lembur hanya bisa diajukan setelah absen masuk');
              return;
            }
          }

          // kalo ada absen nya hari ini
          if (todayAbsen) {
            const status = todayAbsen.status?.toLowerCase();

            // If already izin/alpha/sakit/cuti → block everything
            if (blockedStatuses.includes(status)) {
              showError('Gagal', 'Anda sudah memiliki izin atau tidak hadir hari ini');
              return;
            }

            // If hadir / terlambat → only allow lembur
            if (hadirStatuses.includes(status) && jenis !== 'lembur') {
              showError('Gagal', 'Anda telah absen hari ini dan hanya bisa mengajukan lembur untuk hari ini!');
              return;
            }
          }
        }
      }

    } catch (error) {
      console.error('Error checking attendance:', error);
    }

    try {
      setUploading(true);
      let buktiUrl = existingBukti;

      if (file) {
        buktiUrl = await uploadToCloudinary(file);
      }

      const res = await fetch('/api/karyawan/izin', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          action: isEditing ? 'edit' : undefined,
          karyawan_id: userId,
          jenis_izin: jenisIzin,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalSelesai,
          lembur_mulai: lemburMulai,
          lembur_selesai: lemburSelesai,
          keterangan: keterangan,
          bukti: buktiUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        await showSuccess('Berhasil!', data.message);
        setShowForm(false);
        resetForm();
        if (userId) fetchRiwayat(userId);
      } else {
        showError('Gagal', data.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showError('Error', 'Terjadi kesalahan saat mengunggah bukti atau mengirim data');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setJenisIzin('izin');
    setTanggalMulai('');
    setTanggalSelesai('');
    setLemburMulai('');
    setLemburSelesai('');
    setKeterangan('');
    setFile(null);
    setIsEditing(false);
    setEditingId(null);
    setExistingBukti('');
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'yellow', label: 'Menunggu' };
      case 'disetujui': return { color: 'green', label: 'Disetujui' };
      case 'ditolak': return { color: 'red', label: 'Ditolak' };
      default: return { color: 'gray', label: status };
    }
  };

  const stats = {
    total: riwayatIzin.length,
    disetujui: riwayatIzin.filter(i => i.status === 'disetujui').length,
    pending: riwayatIzin.filter(i => i.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between md:pt-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Izin, Cuti & Lembur</h1>
          <p className="text-gray-600 mt-1">Ajukan dan kelola izin, cuti atau lembur Anda</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 ${showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors font-medium`}
        >
          {showForm ? <FontAwesomeIcon icon={faTrash} /> : <FontAwesomeIcon icon={faPlus} />}
          {showForm ? 'Batal' : 'Ajukan Izin/Cuti'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Pengajuan</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600">
              <FontAwesomeIcon icon={faCheck} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Disetujui</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.disetujui}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center text-yellow-600">
              <FontAwesomeIcon icon={faClock} className="text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Menunggu</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.pending}</h3>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{isEditing ? 'Update Pengajuan Izin' : 'Form Pengajuan Izin'}</h3>

          <form onSubmit={handleSubmitIzin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Izin
                </label>
                <select
                  className="w-full px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  value={jenisIzin}
                  onChange={(e) => setJenisIzin(e.target.value)}
                  required
                  disabled={isEditing}
                >
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="cuti">Cuti</option>
                  <option value="lembur">Lembur</option>
                </select>
              </div>

              {
                jenisIzin != 'lembur' ?
                  (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mulai
                          </label>
                          <input
                            type="date"
                            required
                            value={tanggalMulai}
                            min={`${new Date().getFullYear()}-01-01`}
                            max={`${new Date().getFullYear()}-12-31`}
                            onChange={(e) => setTanggalMulai(e.target.value)}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selesai
                          </label>
                          <input
                            type="date"
                            required
                            value={tanggalSelesai}
                            min={`${new Date().getFullYear()}-01-01`}
                            max={`${new Date().getFullYear()}-12-31`}
                            onChange={(e) => setTanggalSelesai(e.target.value)}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    </>
                  )
                  :
                  (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mulai
                          </label>
                          <input
                            type="time"
                            required
                            value={lemburMulai}
                            min='17:00:00'
                            max='23:59:59'
                            onChange={(e) => setLemburMulai(e.target.value)}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selesai
                          </label>
                          <input
                            type="time"
                            required
                            value={lemburSelesai}
                            min='18:00:00'
                            max='23:59:59'
                            onChange={(e) => setLemburSelesai(e.target.value)}
                            className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    </>
                  )
              }


            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan
              </label>
              <textarea
                rows={4}
                required
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Jelaskan alasan pengajuan izin/cuti..."
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Bukti {isEditing && '(Opsional, biarkan kosong untuk tetap menggunakan bukti lama)'}
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {file ? (
                <p className="mt-1 text-sm text-gray-500 italic">File baru: {file.name}</p>
              ) : existingBukti ? (
                <p className="mt-1 text-sm text-blue-500 italic">Sudah ada bukti terunggah</p>
              ) : null}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <FontAwesomeIcon icon={faClock} className="animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  isEditing ? 'Simpan Perubahan' : 'Ajukan Permohonan'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Pengajuan</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal/Jam</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : riwayatIzin.length > 0 ? (
                riwayatIzin.map((item) => {
                  const info = getStatusInfo(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {item.tanggal_mulai != '' && item.tanggal_mulai != null ? new Date(item.tanggal_mulai).toLocaleDateString('id-ID').replaceAll('/', '-') : item.lembur_mulai}
                        </div>
                        <div className="text-xs text-gray-500">
                          s/d {item.tanggal_selesai != '' && item.tanggal_selesai != null ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID').replaceAll('/', '-') : item.lembur_selesai}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-sm text-gray-600">{item.jenis_izin}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.keterangan}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 bg-${info.color}-100 text-${info.color}-700 text-xs font-semibold rounded-full capitalize`}>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'pending' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faEdit} className="text-xs" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleCancelIzin(item.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              Batalkan
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Belum ada riwayat pengajuan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
