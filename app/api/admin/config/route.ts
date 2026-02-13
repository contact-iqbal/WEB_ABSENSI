import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import test from "node:test";

export async function GET(request: NextRequest) {
    try {
        const [result] = await pool.execute(
            'SELECT * FROM config'
        )
        return NextResponse.json(
            {
                success: true,
                result: result
            },
            { status: 200 }
        )
    } catch (e) {
        console.log(e)
        return NextResponse.json(
            {
                error: e
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const {
            nama_perusahaan,
            alamat_perusahaan,
            no_telp_perusahaan,
            email_perusahaan,
            jam_masuk,
            jam_pulang,
            toleransi_telat
        } = await request.json();

        await pool.execute(`UPDATE config SET nama_perusahaan = ?, alamat_perusahaan = ?, no_telp_perusahaan = ?, email_perusahaan = ?, jam_masuk = ?, jam_pulang = ?, toleransi_telat = ? LIMIT 1`, [nama_perusahaan, alamat_perusahaan,no_telp_perusahaan,email_perusahaan,jam_masuk,jam_pulang,toleransi_telat])

        return NextResponse.json({
            success: true,
            message: "Berhasil Mengupdate!",

        });
    } catch (error) {
        console.error("error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 },
        );
    }
}
