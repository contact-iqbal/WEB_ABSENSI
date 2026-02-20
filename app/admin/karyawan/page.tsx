"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileImport,
  faPlus,
  faDeleteLeft,
  faTrash,
  faPencil,
  faCheck,
  faCheckCircle,
  faCheckToSlot,
  faSave,
  faL,
  faCamera,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {
  showConfirm,
  showError,
  showInfo,
  showSuccess,
} from "@/lib/sweetalert";
import { aliasesdevision, aliasesgender, aliasesstatus, formatIndoPhone } from "@/lib/aliases";

interface karyawan {
  gaji_pokok: string;
  NIK: string;
  no_telp: string;
  email: string;
  alamat: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  agama: string;
  jenis_kel: string;
  id: Number;
  nama: String;
  jabatan: String;
  devisi: String;
  status: String;
  profile_picture: String;
}
interface pendingUpdate {
  id: Number;
  action: String;
  value?: pendingUpdateValue;
}
interface pendingUpdateValue {
  gaji_pokok?: string;
  no_telp?: string;
  email?: string;
  alamat?: string;
  tanggal_lahir?: string;
  tempat_lahir?: string;
  agama?: string;
  jenis_kel?: string;
  NIK?: string;
  id?: Number;
  nama?: String;
  jabatan?: String;
  devisi?: String;
  status?: String;
  profile_picture?: String;
}
export default function KaryawanPage() {
  const [Karyawan, SetKaryawan] = useState<karyawan[]>([]);
  const [editing, Setediting] = useState<null | Number>(0);
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    password: "",
    nama: "",
    jabatan: "karyawan",
    devisi: "default",
    status: "default",
  });

  let [pendingUpdate, SetpendingUpdate] = useState<pendingUpdate>({
    id: 0,
    action: "update",
    value: {
      no_telp: '',
      email: '',
      alamat: '',
      tanggal_lahir: '',
      tempat_lahir: '',
      agama: '',
      jenis_kel: '',
      NIK: '',
      nama: '',
      jabatan: '',
      devisi: '',
      status: '',
      profile_picture: '',
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("-");
  const [uploadingId, setUploadingId] = useState<Number | null>(null);

  useEffect(() => {
    fetchkaryawan();
  }, [filterStatus, searchTerm]);
  useEffect(() => {
    console.log(pendingUpdate)
  }, [pendingUpdate])

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>, id: Number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 5MB limit check
      if (file.size > 5 * 1024 * 1024) {
        showError('Gagal', 'Ukuran file terlalu besar (Maksimal 5MB)');
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          setUploadingId(id);
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              file: reader.result,
              folder: 'web_absensi/profile'
            })
          });
          const data = await res.json();
          if (data.success) {
            SetpendingUpdate((prev) => ({
              ...prev,
              value: { ...(prev.value ?? {}), profile_picture: data.url },
            }));
            showSuccess('Berhasil', 'Foto profil berhasil diunggah (klik Save untuk menyimpan permanently)');
            fetchkaryawan()
          } else {
            showError('Gagal', data.message);
          }
        } catch (error) {
          showError('Error', 'Gagal mengunggah foto');
        } finally {
          setUploadingId(null);
        }
      };
    }
  };
  const fetchkaryawan = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (filterStatus !== "-") params.append("devisi", filterStatus);
    const responses = await fetch(`/api/admin/karyawan?${params.toString()}`);
    const result = await responses.json();

    if (result.success) {
      SetKaryawan(result.result);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.username || !newEmployee.password || !newEmployee.nama) {
      await showError("Error", "Username, password, dan nama harus diisi");
      return;
    }

    try {
      const response = await fetch("/api/admin/karyawan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          ...newEmployee,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await showSuccess("Sukses", "Karyawan berhasil ditambahkan");
        setShowModal(false);
        setNewEmployee({
          username: "",
          password: "",
          nama: "",
          jabatan: "karyawan",
          devisi: "default",
          status: "default",
        });
        fetchkaryawan();
      } else {
        await showError(
          "Error",
          result.message || "Gagal menambahkan karyawan",
        );
      }
    } catch (e) {
      await showError("Error", "Terjadi kesalahan saat menambahkan karyawan");
    }
  };

  const handleEditSave = (k: any) => {
    if (editing === k.id) {
      // SAVE
      if (
        k.nama != pendingUpdate.value?.nama ||
        k.jabatan != pendingUpdate.value?.jabatan ||
        k.devisi != pendingUpdate.value?.devisi ||
        k.status != pendingUpdate.value?.status ||
        k.jenis_kel != pendingUpdate.value?.jenis_kel ||
        k.agama != pendingUpdate.value?.agama ||
        k.tempat_lahir != pendingUpdate.value?.tempat_lahir ||
        k.tanggal_lahir != pendingUpdate.value?.tanggal_lahir ||
        k.alamat != pendingUpdate.value?.alamat ||
        k.email != pendingUpdate.value?.email ||
        k.no_telp != pendingUpdate.value?.no_telp ||
        k.NIK != pendingUpdate.value?.NIK ||
        k.gaji_pokok != pendingUpdate.value?.gaji_pokok ||
        k.profile_picture != pendingUpdate.value?.profile_picture
      ) {
        handlechange(k.id, pendingUpdate.value);
      }
      Setediting(null);

      SetpendingUpdate({
        id: 0,
        action: "update",
        value: {
          no_telp: '',
          email: '',
          alamat: '',
          tanggal_lahir: '',
          tempat_lahir: '',
          agama: '',
          jenis_kel: '',
          NIK: '',
          nama: '',
          jabatan: '',
          devisi: '',
          status: '',
          profile_picture: '',
          gaji_pokok: ''
        },
      });
    } else {
      // EDIT
      Setediting(k.id);

      SetpendingUpdate({
        id: k.id,
        action: "update",
        value: {
          nama: k.nama,
          jabatan: k.jabatan,
          devisi: k.devisi,
          status: k.status,
          no_telp: k.no_telp,
          email: k.email,
          alamat: k.alamat,
          tanggal_lahir: k.tanggal_lahir,
          tempat_lahir: k.tempat_lahir,
          agama: k.agama,
          jenis_kel: k.jenis_kel,
          NIK: k.NIK,
          profile_picture: k.profile_picture,
          gaji_pokok: k.gaji_pokok
        },
      });
    }
  };

  const handlechange = async (id: Number, value: any) => {
    const updatestuff = await fetch("/api/admin/karyawan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        action: "update",
        value: value,
      }),
    });
    const resultupdate = await updatestuff.json();
    if (resultupdate.success) {
      showSuccess("Sukses", `${resultupdate.message}`);
    } else if (!resultupdate.success == false && !resultupdate.error) {
      showInfo(
        "Huh?",
        `${resultupdate.message || resultupdate.error || resultupdate.toString()}`,
      );
    }
    fetchkaryawan();
  };

  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
          <p className="text-gray-600 mt-1">Kelola data karyawan perusahaan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FontAwesomeIcon icon={faPlus} />
          Tambah Karyawan
        </button>
      </div>

      {/* Modal Add Employee */}
      {/* {showModal && ( */}
      <div className={`fixed inset-0 w-full h-full bg-black bg-black/50 flex items-center justify-center z-50 transition-all ${showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Tambah Karyawan Baru
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={newEmployee.username}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, username: e.target.value })
                }
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username untuk login"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={newEmployee.password}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, password: e.target.value })
                }
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={newEmployee.nama}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, nama: e.target.value })
                }
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama lengkap karyawan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan
              </label>
              <select
                value={newEmployee.jabatan}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, jabatan: e.target.value })
                }
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="karyawan">Karyawan</option>
                <option value="bendahara">Bendahara</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Divisi
              </label>
              <select
                value={newEmployee.devisi}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, devisi: e.target.value })
                }
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">-</option>
                <option value="DNA">DNA Jaya Group</option>
                <option value="RT">Rizqi Tour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newEmployee.status}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, status: e.target.value })
                }
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">-</option>
                <option value="pegawai_tetap">Pegawai Tetap</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowModal(false);
                setNewEmployee({
                  username: "",
                  password: "",
                  nama: "",
                  jabatan: "karyawan",
                  devisi: "default",
                  status: "default",
                });
              }}
              className="flex-1 px-4 py-2 bg-red-500 border border-gray-300 text-gray-700 rounded-lg hover:bg-red-600 transition-colors font-medium text-white"
            >
              Batal
            </button>
            <button
              onClick={handleAddEmployee}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
      {/* )} */}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari karyawan..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value={'-'}>Semua Devisi</option>
              <option value={'DNA'}>DNA Jaya Group</option>
              <option value={'RT'}>Rizqi Tour</option>
            </select>
          </div>
        </div>

      </div>
      <div className="flex flex-col gap-6 mx-auto">
        {Karyawan.map((k) => {
          const isEditing = editing === k.id;
          return (
            <div
              key={k.id as number}
              className={`group bg-white w-full border rounded-2xl transition-all duration-300 ${isEditing
                ? "border-blue-400 shadow-lg ring-1 ring-blue-100"
                : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                }`}
            >
              {/* TOP BAR / HEADER */}
              <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar Placeholder */}
                  <div className="relative group/avatar">
                    {pendingUpdate.id === k.id && pendingUpdate.value?.profile_picture ? (
                       <img className="h-14 w-14 rounded-full object-cover flex items-center justify-center text-white font-bold text-xl shadow-inner border-2 border-blue-100" src={pendingUpdate.value.profile_picture.toString()} alt="preview" />
                    ) : k.profile_picture ? (
                      <img className="h-14 w-14 rounded-full object-cover flex items-center justify-center text-white font-bold text-xl shadow-inner" src={k.profile_picture.toString()} alt={String(k.nama)} />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-inner uppercase">
                        {k.nama.charAt(0)}
                      </div>
                    )}

                    {isEditing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleProfilePictureChange(e, k.id)}
                          disabled={uploadingId === k.id}
                        />
                        {uploadingId === k.id ? (
                          <FontAwesomeIcon icon={faSpinner} className="text-white animate-spin text-lg" />
                        ) : (
                          <FontAwesomeIcon icon={faCamera} className="text-white text-lg" />
                        )}
                      </label>
                    )}
                  </div>

                  <div className="space-y-1">
                    {isEditing ? (
                      <input
                        type="text"
                        className="block text-neutral-700 w-full text-lg font-semibold border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={String(pendingUpdate.value?.nama ?? "")}
                        onChange={(e) =>
                          SetpendingUpdate((prev) => ({
                            ...prev,
                            value: { ...(prev.value ?? {}), nama: e.target.value },
                          }))
                        }
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        {k.nama}
                      </h2>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        ID: {k.id.toString()}
                      </span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {isEditing ? (
                          <input
                            type="text"
                            className="block text-neutral-700 w-full text-xm font-semibold border border-blue-300 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={String(pendingUpdate.value?.NIK ?? "")}
                            onChange={(e) =>
                              SetpendingUpdate((prev) => ({
                                ...prev,
                                value: { ...(prev.value ?? {}), NIK: e.target.value },
                              }))
                            }
                          />
                        ) : (
                          k.NIK && k.NIK.toString() || "No NIK"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {k.id !== 1 && (
                  <button
                    className={`px-6 py-2 rounded-xl font-medium transition-all ${isEditing
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-100"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    onClick={() => handleEditSave(k)}
                  >
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </button>
                )}
              </div>

              {/* DETAILS GRID */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Section 1: Employment */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                    <span className="w-4 h-px bg-gray-200"></span> Employment
                  </h3>

                  <div className="grid gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Position</p>
                      {isEditing ? (
                        <select
                          className="w-full text-neutral-700 border border-gray-300 rounded-lg text-sm"
                          value={String(pendingUpdate.value?.jabatan ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), jabatan: e.target.value },
                            }))
                          }
                        >
                          <option value="karyawan">Karyawan</option>
                          <option value="bendahara">Bendahara</option>
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-gray-700 capitalize">{k.jabatan}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Division</p>
                      {isEditing ? (
                        <select
                          className="w-full text-neutral-700 border border-gray-300 rounded-lg text-sm"
                          value={String(pendingUpdate.value?.devisi ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), devisi: e.target.value },
                            }))
                          }
                        >
                          <option value="default">-</option>
                          <option value="DNA">DNA Jaya Group</option>
                          <option value="RT">Rizqi Tour</option>
                        </select>
                      ) : (
                        <p className="text-sm font-semibold text-gray-700 uppercase">
                          {k.devisi === "default" ? "-" : aliasesdevision(k.devisi)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                    <span className="w-4 h-px bg-gray-200"></span> Personal Info
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      {isEditing ? (
                        <select
                          className="border text-neutral-700 border-gray-300 px-2 py-1 rounded text-xs"
                          value={String(pendingUpdate.value?.jenis_kel ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), jenis_kel: e.target.value },
                            }))
                          }
                        >
                          <option value="default">-</option>
                          <option value="laki_laki">Laki Laki</option>
                          <option value="perempuan">Perempuan</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-700">{k.jenis_kel === 'default' || k.jenis_kel === null ? '-' : aliasesgender(k.jenis_kel)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Religion</p>
                      {isEditing ? (
                        <select
                          className="border text-neutral-700 border-gray-300 px-2 py-1 rounded text-xs"
                          value={String(pendingUpdate.value?.agama ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), agama: e.target.value },
                            }))
                          }
                        >
                          <option value="default">-</option>
                          <option value="islam">Islam</option>
                          <option value="kristen">Kristen</option>
                          <option value="hindu">Hindu</option>
                          <option value="budha">Budha</option>
                          <option value="katolik">Katolik</option>
                          <option value="konghucu">Konghucu</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-700">{k.agama === '' || k.agama === null ? '-' : k.agama}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Birth Date</p>
                      <div className="flex text-black">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              className="text-sm font-medium text-gray-700 w-[90px] border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              value={String(pendingUpdate.value?.tempat_lahir ?? '')}
                              onChange={(e) =>
                                SetpendingUpdate((prev) => ({
                                  ...prev,
                                  value: { ...(prev.value ?? {}), tempat_lahir: e.target.value },
                                }))
                              }
                            />
                            ,
                            <input type="date" className="text-black text-sm font-medium text-gray-700 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              value={new Date(String(pendingUpdate.value?.tanggal_lahir)).toLocaleDateString('en-CA').replaceAll('/', '-')}
                              onChange={(e) =>
                                SetpendingUpdate((prev) => ({
                                  ...prev,
                                  value: { ...(prev.value ?? {}), tanggal_lahir: e.target.value },
                                }))} />
                          </>
                        ) : (
                          <p className="text-sm font-medium text-gray-700">{k.tempat_lahir === '' || k.tempat_lahir === null ? '-' : k.tempat_lahir}, {k.tanggal_lahir === '' || k.tanggal_lahir === null ? '-' : new Date(k.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).replaceAll('/', '-')}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Address</p>
                      {isEditing ? (
                        <textarea
                          className="text-sm font-medium text-gray-700 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={String(pendingUpdate.value?.alamat ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), alamat: e.target.value },
                            }))
                          }
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-700">{k.alamat === '' || k.alamat === null ? '-' : k.alamat}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact & Status */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Status & Contact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Contract</span>
                      {isEditing ? (
                        <select
                          className="border text-neutral-700 border-gray-300 px-2 py-1 rounded text-xs"
                          value={String(pendingUpdate.value?.status ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), status: e.target.value },
                            }))
                          }
                        >
                          <option value="default">-</option>
                          <option value="pegawai_tetap">Permanen</option>
                          <option value="pegawai_sementara">Sementara</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${k.status === 'pegawai_tetap' ? 'bg-green-100 text-green-700' : k.status === 'pegawai_sementara' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'}`}>
                          {k.status === "default" ? "Not Set" : aliasesstatus(k.status)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      {isEditing ? (
                        <input
                          type="text"
                          className="text-sm font-medium text-gray-700 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={String(pendingUpdate.value?.email ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), email: e.target.value },
                            }))
                          }
                        />
                      ) : (
                        <a href={`mailto:${k.email}`} className="text-sm font-medium text-blue-600 truncate">{k.email === '' || k.email === null ? '-' : k.email}</a>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      {isEditing ? (
                        <input
                          type="text"
                          className="text-sm font-medium text-gray-700 w-full border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={String(pendingUpdate.value?.no_telp ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), no_telp: e.target.value },
                            }))
                          }
                        />
                      ) : (
                        <a href={`tel:${k.no_telp}`} className="text-sm font-medium text-blue-600 truncate">{k.no_telp === '' || k.no_telp === null ? '-' : formatIndoPhone(k.no_telp)}</a>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Salary</p>
                      {isEditing ? (
                        <input
                          type="text"
                          className="block text-neutral-700 w-full text-lg font-semibold border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          value={String(pendingUpdate.value?.gaji_pokok ?? "")}
                          onChange={(e) =>
                            SetpendingUpdate((prev) => ({
                              ...prev,
                              value: { ...(prev.value ?? {}), gaji_pokok: e.target.value },
                            }))
                          }
                        />
                      ) : (
                        <p className="text-sm font-bold text-gray-800">{k.gaji_pokok && new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(Number(k.gaji_pokok)) || "Not Set"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
