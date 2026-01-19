import { hashPassword } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const [result] = await pool.execute(
            'SELECT * FROM karyawan'
        )
        return NextResponse.json(
            {
                success: true,
                result: result
            },
            { status: 200 }
        )
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            {
                success: false,
                error: e
            },
            { status: 500 }
        );
    }
}
export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username dan password harus diisi' },
                { status: 400 }
            );
        }

        console.log("create account")
        const hashedpass = await hashPassword(password) // lupa ganti value nya jir awalnya 120 walah nunggu setaon loh ya
        const [accountinsert]: any = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedpass]
        );
        const insertedid = accountinsert.insertId;
        await pool.execute('INSERT INTO karyawan (id, nama) VALUES (?, ?)', [insertedid, username])

        return NextResponse.json({
            success: true,
            message: 'Akun berhasil dibuat',
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }

}