import { hashPassword } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { json } from "stream/consumers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const devisi = searchParams.get("devisi");
    const search = searchParams.get("search");

    let query = `SELECT * FROM karyawan WHERE jabatan != "superadmin"`
    const params: any[] = [];

    if (search) {
      query += ` AND nama LIKE ?`;
      params.push(`%${search}%`);
    }
    if (devisi && devisi != '-') {
      query += ` AND devisi = ?`;
      params.push(`${devisi}`);
    }
    const [result] = await pool.execute(
      query,params
    );
    return NextResponse.json(
      {
        success: true,
        debug: {query: query, params: params, devisi: devisi},
        result: result,
      },
      { status: 200 },
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        success: false,
        error: e,
      },
      { status: 500 },
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const {
      id,
      action,
      value,
      username,
      password,
      nama,
      jabatan,
      devisi,
      status,
    } = await request.json();

    if (action == "create") {
      // Check if username already exists
      const [existingUser]: any = await pool.execute(
        "SELECT id FROM users WHERE username = ?",
        [username],
      );

      if (existingUser.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Username sudah digunakan",
          },
          { status: 400 },
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Insert into users table
      const [userResult]: any = await pool.execute(
        "INSERT INTO users (username, password, type) VALUES (?, ?, ?)",
        [username, hashedPassword, "pegawai"],
      );

      const newUserId = userResult.insertId;

      // Insert into karyawan table
      await pool.execute(
        `INSERT INTO karyawan (id, nama, jabatan, devisi, status, profile_picture, NIK, gaji_pokok) 
                 VALUES (?, ?, ?, ?, ?, '', 0, 0)`,
        [newUserId, nama, jabatan, devisi, status],
      );

      return NextResponse.json({
        success: true,
        message: "Karyawan berhasil ditambahkan",
      });
    }

    if (action == "update") {
      if (!id && !value) {
        return NextResponse.json(
          {
            success: false,
            error: "Update dibatalkan",
          },
          { status: 400 },
        );
      }
      if (id && value.nama) {
        await pool.execute(`UPDATE karyawan SET nama = ? WHERE id = ?`, [
          value.nama,
          id,
        ]);
      }
      if (id && value.devisi) {
        await pool.execute(`UPDATE karyawan SET devisi = ? WHERE id = ?`, [
          value.devisi,
          id,
        ]);
      }
      if (id && value.jabatan) {
        await pool.execute(`UPDATE karyawan SET jabatan = ? WHERE id = ?`, [
          value.jabatan,
          id,
        ]);
      }
      if (id && value.status) {
        await pool.execute(`UPDATE karyawan SET status = ? WHERE id = ?`, [
          value.status,
          id,
        ]);
      }
      if (id && value.jenis_kel) {
        await pool.execute(`UPDATE karyawan SET jenis_kel = ? WHERE id = ?`, [
          value.jenis_kel,
          id,
        ]);
      }
      if (id && value.agama) {
        await pool.execute(`UPDATE karyawan SET agama = ? WHERE id = ?`, [
          value.agama,
          id,
        ]);
      }
      if (id && value.tempat_lahir) {
        await pool.execute(`UPDATE karyawan SET tempat_lahir = ? WHERE id = ?`, [
          value.tempat_lahir,
          id,
        ]);
      }
      if (id && value.tanggal_lahir) {
        await pool.execute(`UPDATE karyawan SET tanggal_lahir = STR_TO_DATE(?,'%Y-%m-%dT%H:%i:%s.000Z') WHERE id = ?`, [
          value.tanggal_lahir,
          id,
        ]);
      }
      if (id && value.alamat) {
        await pool.execute(`UPDATE karyawan SET alamat = ? WHERE id = ?`, [
          value.alamat,
          id,
        ]);
      }
      if (id && value.email) {
        await pool.execute(`UPDATE karyawan SET email = ? WHERE id = ?`, [
          value.email,
          id,
        ]);
      }
      if (id && value.no_telp) {
        await pool.execute(`UPDATE karyawan SET no_telp = ? WHERE id = ?`, [
          value.no_telp,
          id,
        ]);
      }
      if (id && value.NIK) {
        await pool.execute(`UPDATE karyawan SET NIK = ? WHERE id = ?`, [
          value.NIK,
          id,
        ]);
      }
      if (id && value.gaji_pokok) {
        await pool.execute(`UPDATE karyawan SET gaji_pokok = ? WHERE id = ?`, [
          value.gaji_pokok,
          id,
        ]);
      }
      return NextResponse.json({
        success: true,
        message: "Berhasil Mengupdate!",
      });
    }
  } catch (error) {
    console.error("error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
