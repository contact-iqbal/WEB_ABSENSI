import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const [result] = await pool.execute(
            'SELECT * FROM absensi'
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