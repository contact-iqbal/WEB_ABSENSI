import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const {id} = await request.json()
    try {
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