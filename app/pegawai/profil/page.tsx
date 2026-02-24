'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faPhone, faMapMarkerAlt,
  faBriefcase, faCalendar, faEdit, faSave,
  faCamera, faSpinner, faIdCard, faMapPin,
  faVenusMars, faPray, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { showSuccess, showError, showToast, showInfo } from '@/lib/sweetalert';

interface profilestructure {
  id: number,
  NIK: string,
  nama: string,
  acc_created: string,
  agama: string,
  alamat: string,
  devisi: string,
  email: string,
  gaji_pokok: number,
  jabatan: string,
  jenis_kel: string,
  no_telp: string,
  profile_picture: string | null,
  status: string,
  tanggal_lahir: string,
  tempat_lahir: string
}

export default function ProfilPage() {
    const [profiledata, setProfileData] = useState<profilestructure | null>(null);
    const [edit, setEdit] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState<Partial<profilestructure>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
    useEffect(() => {
      getdata();
    }, []);
  
    const getdata = async () => {
      try {
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        
        const res = await fetch('/api/karyawan/personal_data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: session.userId })
        });
        const data = await res.json();
  
        if (data.success) {
          const result = data.result[0];
          setProfileData(result);
          setPendingUpdate(result);
          setPreviewImage(result.profile_picture);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
  
    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
          showError('Gagal', 'Ukuran file terlalu besar (Maksimal 5MB)');
          return;
        }
  
        setSelectedFile(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setPreviewImage(reader.result as string);
          setEdit(true); // Auto enter edit mode if picture changed
        };
      }
    };
  
    const handleSave = async () => {
      try {
        setUploading(true);
        let finalProfilePicture = pendingUpdate.profile_picture;
  
        // Only upload to Cloudinary if a new file was selected
        if (selectedFile) {
          const resUpload = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              file: previewImage,
              folder: 'web_absensi/profile'
            })
          });
          const dataUpload = await resUpload.json();
          if (dataUpload.success) {
            finalProfilePicture = dataUpload.url;
          } else {
            showError('Gagal', 'Gagal mengunggah foto profil');
            setUploading(false);
            return;
          }
        }
  
        const res = await fetch('/api/karyawan/personal_data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: profiledata?.id,
            action: 'update',
            value: { ...pendingUpdate, profile_picture: finalProfilePicture }
          })
        });
        const data = await res.json();
        if (data.success) {
          showSuccess('Berhasil', data.message);
          setEdit(false);
          setSelectedFile(null);
          getdata();
        } else {
          showError('Gagal', data.message);
        }
      } catch (error) {
        showError('Error', 'Gagal menyimpan perubahan');
      } finally {
        setUploading(false);
      }
    };
  
    const handleCancel = () => {
      setPendingUpdate(profiledata || {});
      setPreviewImage(profiledata?.profile_picture || null);
      setSelectedFile(null);
      setEdit(false);
      showToast('Aksi Dibatalkan','info')
    };
  const aliasesdevisi = (alias: string) => {
    if (alias === "RT") return "Rizqi Tour";
    if (alias === "DNA") return "DNA Jaya Group";
    return "-";
  };

  const aliasesstatus = (alias: string) => {
    if (alias === "pegawai_tetap") return "Karyawan Tetap";
    if (alias === "pegawai_sementara") return "Karyawan Sementara";
    return "-";
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  };

  if (!profiledata) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className='md:pt-12'>
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-gray-600 mt-1">Kelola informasi pribadi dan foto profil Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-md">
                {previewImage ? (
                  <img src={previewImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold uppercase">
                    {profiledata.nama.charAt(0)}
                  </div>
                )}
              </div>

              {edit && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfilePictureChange} disabled={uploading} />
                  {uploading ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-2xl" />
                  ) : (
                    <FontAwesomeIcon icon={faCamera} className="text-white text-2xl" />
                  )}
                </label>
              )}
            </div>


            <h3 className="text-xl font-bold text-gray-800">{profiledata.nama}</h3>
            <p className="text-blue-600 font-medium text-sm mt-1 uppercase tracking-wide">
              {profiledata.jabatan}
            </p>

            <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faIdCard} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">ID Pegawai</p>
                  <p className="font-semibold text-gray-700">{profiledata.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalendar} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Bergabung</p>
                  <p className="font-semibold text-gray-700">{new Date(profiledata.acc_created).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={faBriefcase} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Divisi</p>
                  <p className="font-semibold text-gray-700">{aliasesdevisi(profiledata.devisi)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                Informasi Pribadi
              </h3>
              <div className="flex gap-2">
                {edit ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={uploading}
                      className="px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
                    >
                      {uploading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} />
                          Simpan
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={uploading}
                      className="px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setPendingUpdate(profiledata || {});
                      setEdit(true);
                    }}
                    className="px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 text-blue-600 hover:bg-blue-50"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit Profil
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: 'Nama Lengkap', key: 'nama', icon: faUser },
                { label: 'NIK', key: 'NIK', icon: faIdCard },
                { label: 'Tempat Lahir', key: 'tempat_lahir', icon: faMapPin },
                { label: 'Tanggal Lahir', key: 'tanggal_lahir', icon: faCalendar, type: 'date' },
                { label: 'Jenis Kelamin', key: 'jenis_kel', icon: faVenusMars, type: 'select', options: [['laki_laki', 'Laki-laki'], ['perempuan', 'Perempuan']] },
                { label: 'Agama', key: 'agama', icon: faPray, type: 'select', options: [['default','-'],['islam', 'Islam'], ['kristen', 'Kristen'], ['katolik', 'Katolik'], ['hindu', 'Hindu'], ['budha', 'Budha'], ['konghucu', 'Konghucu']] },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                    {field.label}
                  </label>
                  {edit ? (
                    field.type === 'select' ? (
                      <select
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                        value={String(pendingUpdate[field.key as keyof profilestructure] || '')}
                        onChange={(e) => setPendingUpdate(prev => ({ ...prev, [field.key]: e.target.value }))}
                      >
                        <option value="">Pilih {field.label}</option>
                        {field.options?.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                        value={field.type === 'date' ? (pendingUpdate[field.key as keyof profilestructure] ? new Date(String(pendingUpdate[field.key as keyof profilestructure])).toISOString().split('T')[0] : '') : String(pendingUpdate[field.key as keyof profilestructure] || '')}
                        onChange={(e) => setPendingUpdate(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    )
                  ) : (
                    <p className="font-semibold text-gray-700 capitalize">
                      {field.key === 'jenis_kel' ? (pendingUpdate.jenis_kel === 'laki_laki' ? 'Laki laki' : pendingUpdate.jenis_kel === 'perempuan' ? 'Perempuan' : '-') : field.key === 'tanggal_lahir' && pendingUpdate.tanggal_lahir != null ? (new Date(String(pendingUpdate.tanggal_lahir)).toLocaleDateString('id-ID', {day:'2-digit',month : 'long', year:'numeric'})) : pendingUpdate.agama === 'default' ? '-' : String(pendingUpdate[field.key as keyof profilestructure] || '-')}
                    </p>
                  )}
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  Alamat Lengkap
                </label>
                {edit ? (
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                    value={pendingUpdate.alamat || ''}
                    onChange={(e) => setPendingUpdate(prev => ({ ...prev, alamat: e.target.value }))}
                  />
                ) : (
                  <p className="font-semibold text-gray-700">{profiledata.alamat || '-'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-white">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
                Kontak & Pekerjaan
              </h3>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  {edit ? (
                    <input
                      type="email"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                      value={pendingUpdate.email || ''}
                      onChange={(e) => setPendingUpdate(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <p className="font-semibold text-gray-700">{profiledata.email || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                  {edit ? (
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                      value={pendingUpdate.no_telp || ''}
                      onChange={(e) => setPendingUpdate(prev => ({ ...prev, no_telp: e.target.value }))}
                    />
                  ) : (
                    <p className="font-semibold text-gray-700">{profiledata.no_telp || '-'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6 bg-gray-50 p-6 rounded-2xl">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Salary Info</p>
                  <p className="text-2xl font-bold text-gray-800">{formatRupiah(profiledata.gaji_pokok)}</p>
                  <p className="text-xs text-gray-500 mt-1">Gaji pokok bulanan</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Status Kontrak</p>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {aliasesstatus(profiledata.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
