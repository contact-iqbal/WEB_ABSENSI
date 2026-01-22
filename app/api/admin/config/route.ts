import pool from "@/lib/db";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

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
            {status: 500}
        )
    }
}