import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { comparePassword, generateToken, hashPassword } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberme } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi" },
        { status: 400 },
      );
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE username = ?",
      [username],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Akun tidak ada atau salah!" },
        { status: 401 },
      );
    }

    const user = rows[0];
    const isPasswordValid = await comparePassword(password, user.password);

    const [realname]: any = await pool.execute(
      "SELECT nama FROM karyawan WHERE id = ?",
      [user.id],
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 },
      );
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      password: user.password,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        real_name:
          realname && realname.length > 0 ? realname[0].nama : user.username,
        type: user.type,
      },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberme ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
