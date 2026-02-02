import { hashPassword } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { json } from "stream/consumers";

export async function GET(request: NextRequest) {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM users WHERE type != "admin"',
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
    const { username, password, id, action } = await request.json();
    if (action == "create") {
      console.log("create account");
      if (!username || !password) {
        return NextResponse.json(
          { error: "Username dan password harus diisi" },
          { status: 400 },
        );
      }
      const hashedpass = await hashPassword(password);
      const [accountinsert]: any = await pool.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedpass],
      );
      const insertedid = accountinsert.insertId;
      await pool.execute(
        "INSERT INTO karyawan (id, nama, NIK, devisi, status, gaji_pokok) VALUES (?, ?, ?, ?, ?, ?)",
        [insertedid, username, 0, "default", "default", 0],
      );

      return NextResponse.json({
        success: true,
        message: "Akun berhasil dibuat",
      });
    } else if (action == "delete") {
      if (!id) {
        return NextResponse.json(
          {
            error: "Id tidak ada!",
          },
          { status: 400 },
        );
      }
      if (id == 1) {
        return NextResponse.json(
          {
            error: "Akun admin tidak dapat dihapus!",
          },
          { status: 400 },
        );
      }
      const [checkammount]: any = await pool.execute(
        'SELECT COUNT(*) AS total_karyawan FROM karyawan WHERE jabatan != "superadmin"',
      );
      if (checkammount[0].total_karyawan == 1) {
        return NextResponse.json(
          {
            error: "Akun karyawan minimal ada 1!",
          },
          { status: 400 },
        );
      }
      const [usernamecheck]: any = await pool.execute(
        "SELECT nama FROM karyawan WHERE id = ?",
        [id],
      );
      await pool.execute("DELETE FROM users WHERE id = ?", [id]);
      return NextResponse.json({
        success: true,
        message: `Akun dengan Nama "${usernamecheck[0].nama}" dan id:${id} telah dihapus!`,
      });
    } else if (action == "update") {
      if (!id && !username && !password) {
        return NextResponse.json(
          {
            success: false,
            error: "Update dibatalkan",
          },
          { status: 400 },
        );
      }
      if (id && username) {
        await pool.execute(`UPDATE users SET username = ? WHERE id = ?`, [
          username,
          id,
        ]);
      }
      if (id && password) {
        const hashed = await hashPassword(password);
        await pool.execute(`UPDATE users SET password = ? WHERE id = ?`, [
          hashed,
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
