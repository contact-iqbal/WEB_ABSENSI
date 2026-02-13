import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { id, requests, absen_masuk, absen_keluar, status } = await request.json()
    try {
        if (requests == 'jam_masuk') {
            const [checkdupli]: any = await pool.execute('SELECT COUNT(*) AS current_absen FROM absensi WHERE id = ? AND tanggal = CURDATE()', [id])
            if (checkdupli[0].current_absen > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'tidak dapat mengganti waktu masuk karena sudah ada!',
                    },
                    { status: 500 }
                )
            } else {
                const [result] = await pool.execute(
                    'INSERT INTO absensi (id, absen_masuk, status, tanggal) VALUES (?, STR_TO_DATE(? , "%H.%i"), ?, CURDATE())',
                    [id, absen_masuk, status]
                )
                return NextResponse.json(
                    {
                        success: true,
                    },
                    { status: 200 }
                )
            }
        } else if (requests == 'jam_keluar') {
            const [result] = await pool.execute(
                'UPDATE absensi SET absen_keluar = (STR_TO_DATE(? , "%H.%i")) WHERE id = ? AND tanggal = CURDATE()',
                [absen_keluar, id]
            )
            return NextResponse.json(
                {
                    success: true,
                },
                { status: 200 }
            )
        } else if (requests == 'fetch') {
            const [fetchabsen] = await pool.execute('SELECT * FROM absensi WHERE id = ? AND tanggal = CURDATE()', [id])
            return NextResponse.json(
                {
                    success: true,
                    result: fetchabsen,
                },
                { status: 200 }
            )
        } else if (requests == 'fetch_all') {
            const [fetchabsenall] = await pool.execute('SELECT * FROM absensi WHERE id = ? ORDER BY tanggal DESC', [id])
            const [statshadir]:any = await pool.execute('SELECT COUNT(*) AS hadir_result FROM absensi WHERE id = ? AND status = "hadir"', [id])
            const [statsterlambat]:any = await pool.execute('SELECT COUNT(*) AS terlambat_result FROM absensi WHERE id = ? AND status = "terlambat"', [id])
            return NextResponse.json(
                {
                    success: true,
                    result: {
                        history: fetchabsenall,
                        hadir: statshadir[0].hadir_result,
                        terlambat: statsterlambat[0].terlambat_result,
                    },
                },
                { status: 200 }
            )
        }
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            {
                success: false,
                error: e,
            },
            { status: 500 }
        );
    }
}