import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { id, action, value } = await request.json()
    try {
        if (action === 'update') {
            const {
                nama, NIK, tempat_lahir, tanggal_lahir,
                jenis_kel, agama, alamat, email, no_telp, profile_picture
            } = value;

            await pool.execute(
                `UPDATE karyawan SET 
                    nama = ?, NIK = ?, tempat_lahir = ?, tanggal_lahir = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.000Z'), 
                    jenis_kel = ?, agama = ?, alamat = ?, email = ?, 
                    no_telp = ?, profile_picture = ?
                 WHERE id = ?`,
                [
                    nama, NIK, tempat_lahir, tanggal_lahir,
                    jenis_kel, agama, alamat, email, no_telp, profile_picture, id
                ]
            );

            return NextResponse.json(
                {
                    success: true,
                    message: "Data pribadi berhasil diperbarui"
                },
                { status: 200 }
            );
        }

        // Default: Fetch
        const [result] = await pool.execute(
            'SELECT * FROM karyawan WHERE id = ?',
            [id]
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