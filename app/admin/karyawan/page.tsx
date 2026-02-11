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

interface karyawan {
  id: Number;
  nama: String;
  jabatan: String;
  devisi: String;
  status: String;
}
interface pendingUpdate {
  id: Number;
  action: String;
  value?: pendingUpdateValue;
}
interface pendingUpdateValue {
  nama?: String;
  jabatan?: String;
  devisi?: String;
  status?: String
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
      nama: "",
      jabatan: "",
      devisi: "",
      status: ""
    },
  });
  useEffect(() => {
    fetchkaryawan();
  }, []);
  const fetchkaryawan = async () => {
    const responses = await fetch("/api/admin/karyawan");
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
        k.status != pendingUpdate.value?.status
      ) {
        handlechange(k.id, pendingUpdate.value);
      }
      Setediting(null);

      SetpendingUpdate({
        id: 0,
        action: "update",
        value: {
          nama: "",
          jabatan: "",
          devisi: "",
          status: ""
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
        },
      });
    }
  };
  function aliasesstatus(alias: String) {
    if (alias === "pegawai_tetap") {
      return "Karyawan Tetap";
    } else {
      return "";
    }
  }

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
    <div className="space-y-6">
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
                className="w-full px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-4 py-2 border text-neutral-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Semua Devisi</option>
              <option>DNA Jaya Group</option>
              <option>Rizqi Tour</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2.5">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Jabatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Devisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-fit">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Karyawan.map((k) => (
                <tr key={k.id as number} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">
                      {k.id.toString()}
                    </p>
                  </td>
                  {editing == k.id ? (
                    <td className="p-2">
                      <input
                        type="text"
                        className="w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg"
                        value={String(pendingUpdate.value?.nama ?? "")}
                        onChange={(e) =>
                          SetpendingUpdate((prev) => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              nama: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                  ) : (
                    <td className="px-6 py-4 text-gray-600">{k.nama}</td>
                  )}
                  {editing == k.id ? (
                    <td className="p-2 text-gray-600">
                      <select
                        name="jabatan"
                        id="jabatan"
                        className="w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg"
                        value={String(pendingUpdate.value?.jabatan ?? "")}
                        onChange={(e) =>
                          SetpendingUpdate((prev) => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              jabatan: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="karyawan">Karyawan</option>
                        <option value="bendahara">Bendahara</option>
                      </select>
                    </td>
                  ) : (
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {k.jabatan}
                    </td>
                  )}
                  {editing == k.id ? (
                    <td className="p-2 text-gray-600">
                      <select
                        name="devisi"
                        id="devisi"
                        className="w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg"
                        value={String(pendingUpdate.value?.devisi ?? "")}
                        onChange={(e) =>
                          SetpendingUpdate((prev) => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              devisi: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="default">-</option>
                        <option value="DNA">DNA Jaya Group</option>
                        <option value="RT">Rizqi Tour</option>
                      </select>
                    </td>
                  ) : (
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {k.devisi == "default"
                        ? "-"
                        : k.devisi == "DNA"
                          ? "DNA Jaya Group"
                          : k.devisi == "RT"
                            ? "Rizqi Tour"
                            : ""}
                    </td>
                  )}
                  {editing == k.id ? (
                    <td className="p-2 text-gray-600">
                      <select
                        name="status"
                        id="status"
                        className="w-full text-neutral-700 border border-neutral-300 px-4 py-2 rounded-lg"
                        value={String(pendingUpdate.value?.status ?? "")}
                        onChange={(e) =>
                          SetpendingUpdate((prev) => ({
                            ...prev,
                            value: {
                              ...(prev.value ?? {}),
                              status: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="default">-</option>
                        <option value="pegawai_tetap">Karyawan tetap</option>
                      </select>
                    </td>
                  ) : (
                    <td className="px-6 py-4">
                      {k.status == "default" ? (
                        <span
                          className={`px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-full`}
                        >
                          No Info
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full`}
                        >
                          {aliasesstatus(k.status)}
                        </span>
                      )}
                    </td>
                  )}

                  <td className="flex px-6 py-4 justify-end gap-1">
                    {k.id !== 1 && (
                      <>
                        <button
                          className="bg-blue-500 p-1.5 hover:bg-blue-600 hover:scale-105 rounded-lg transition cursor-pointer"
                          onClick={() => handleEditSave(k)}
                        >
                          {editing == k.id ? (
                            <div className="flex flex-row justify-center items-center w-fit gap-2">
                              <p>Apply</p>
                              <FontAwesomeIcon icon={faSave} />
                            </div>
                          ) : (
                            <FontAwesomeIcon icon={faPencil} />
                          )}
                        </button>
                        {/* <button className='bg-red-500 p-1.5 hover:bg-red-600 hover:scale-105 rounded-lg transition cursor-pointer' onClick={() => (handledelete(k.id))}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button> */}
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {Karyawan.length == 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada data karyawan. Silakan tambah data atau import
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
