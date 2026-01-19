import { hashPassword } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"
import { json } from "stream/consumers";

export async function GET(request: NextRequest) {
    try {
        const [result] = await pool.execute(
            'SELECT * FROM karyawan WHERE jabatan = "karyawan"'
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
        const { username, password, id, action, type, value } = await request.json();
        if (action == 'create') {
            console.log("create account")
            if (!username || !password) {
                return NextResponse.json(
                    { error: 'Username dan password harus diisi' },
                    { status: 400 }
                );
            }
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
        } else if (action == "delete") {
            if (!id) {
                return NextResponse.json({
                    error: 'Id tidak ada!'
                }, { status: 400 })
            }
            if (id == 1) {
                return NextResponse.json({
                    error: 'Akun admin tidak dapat dihapus!'
                }, { status: 400 })
            }
            const [checkammount]: any = await pool.execute(
                'SELECT COUNT(*) AS total_karyawan FROM karyawan WHERE jabatan = "karyawan"'
            )
            if (checkammount[0].total_karyawan == 1) {
                return NextResponse.json({
                    error: 'Akun karyawan minimal ada 1!'
                }, { status: 400 })
            }
            const [usernamecheck]: any = await pool.execute(
                'SELECT nama FROM karyawan WHERE id = ?',
                [id]
            )
            await pool.execute(
                'DELETE FROM karyawan WHERE id = ?', [id]
            )
            return NextResponse.json({
                success: true,
                message: `Akun dengan Nama "${usernamecheck[0].nama}" dan id:${id} telah dihapus!`,
            });
        } else if (action == "update") {
            if (!id && type == '' && value == '') {
                return NextResponse.json({
                    success: false,
                    error: 'Update dibatalkan'
                }, { status: 400 })
            }
            await pool.execute(
                `UPDATE karyawan SET ${type} = '${value}' WHERE id = ?`,
                [id]
            )
            return NextResponse.json({
                success: true,
                message: 'Berhasil Mengupdate!'
            })
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }

}