"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { showError, showSuccess } from "@/lib/sweetalert";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberme: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const result = await response.json();

      if (result.success) {
        if (result.accountAccess === "admin") {
          router.push("/admin");
        } else {
          router.push("/pegawai");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.username || !formData.password) {
      await showError("Error", "Email dan password harus diisi!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (result.success) {
        if (result.message) {
          await showSuccess("Akun dibuat!", `${result.message}`);
          setLoading(false);
          router.refresh();
        } else {
          await showSuccess(
            "Berhasil Login!",
            `Selamat datang, ${result.user.real_name}!`,
          );
          setLoading(false);
          router.push(result.user.type === "admin" ? "/admin" : "/pegawai");
        }
      } else {
        setLoading(false);
        await showError("Login Gagal", `${result.error}`);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* SISI KIRI: Form Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative">
        <div className="mb-10 flex items-center gap-2">
          {/* Logo Placeholder */}
          <img src="/logo.png" alt="Logo" className="w-32 h-12" />
        </div>

        <div className="max-w-md w-full">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Selamat datang!
          </h1>
          <p className="text-neutral-500 mb-8">
            Silahkan masukkan username dan password anda untuk login
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Username"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all text-neutral-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-all text-neutral-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 cursor-pointer rounded-lg font-bold text-white transition-all shadow-md ${
                loading
                  ? "bg-neutral-400 cursor-not-allowed"
                  : "bg-neutral-800 hover:bg-neutral-800 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-8 md:left-24 lg:left-32 right-8 flex justify-between items-center text-xs text-neutral-400">
          <p>Copyright © 2026 DNA advertising</p>
        </div>
      </div>

      {/* SISI KANAN: Visual Pixel Pattern */}
      <div className="hidden lg:flex w-1/2 bg-[#223082] relative items-center justify-center overflow-hidden">
        {/* Pola Grid Pixel (CSS Pattern) */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        ></div>

        {/* Konten Dekoratif di Tengah */}
        <div className="relative z-10 text-center">
          <img src="/logo.png" alt="" />
        </div>

        {/* Variasi Kotak-kotak Pixel Sesuai Gambar */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-10">
          {[
            { col: 2, row: 3, filled: true },
            { col: 8, row: 7, filled: false },
            { col: 6, row: 11, filled: true },
            { col: 10, row: 1, filled: false },
            { col: 4, row: 9, filled: true },
            { col: 11, row: 5, filled: false },
            { col: 1, row: 8, filled: true },
            { col: 7, row: 2, filled: false },
            { col: 3, row: 6, filled: true },
            { col: 9, row: 10, filled: false },
            { col: 5, row: 4, filled: true },
            { col: 12, row: 12, filled: false },
            { col: 6, row: 1, filled: true },
            { col: 2, row: 10, filled: false },
            { col: 8, row: 5, filled: true },
            { col: 4, row: 12, filled: false },
            { col: 11, row: 3, filled: true },
            { col: 1, row: 7, filled: false },
            { col: 9, row: 9, filled: true },
            { col: 3, row: 2, filled: false },
          ].map((cell, i) => (
            <div
              key={i}
              className="border border-white/20"
              style={{
                gridColumnStart: cell.col,
                gridRowStart: cell.row,
                backgroundColor: cell.filled
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
