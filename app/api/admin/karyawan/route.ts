import { hashPassword } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { json } from "stream/consumers";

export async function GET(request: NextRequest) {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM karyawan WHERE jabatan != "superadmin"',
    );
    return NextResponse.json(
      {
        success: true,
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
