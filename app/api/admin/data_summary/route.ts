import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const [result]:any = await pool.execute(
            'SELECT COUNT(*) AS total_karyawan FROM karyawan'
        )
        return NextResponse.json(
            {
                success: true,
                result: [
                    {karyawan: result[0].total_karyawan}
                ]
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