import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = `
            SELECT i.*, k.nama, k.jabatan, u.username as approved_by_name
            FROM izin i
            JOIN karyawan k ON i.karyawan_id = k.id
            LEFT JOIN users u ON i.approved_by = u.id
            WHERE 1=1
        `;
    const params: any[] = [];

    if (status && status !== "Semua Status") {
      query += ` AND i.status = ?`;
      params.push(status.toLowerCase());
    }

    if (search) {
      query += ` AND k.nama LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY i.created_at DESC`;

    const [result] = await pool.execute(query, params);

    // Get statistics
    const [stats]: any = await pool.execute(`
            SELECT 
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'disetujui' THEN 1 END) as disetujui,
                COUNT(CASE WHEN status = 'ditolak' THEN 1 END) as ditolak
            FROM izin
        `);

    return NextResponse.json(
      {
        success: true,
        result: result,
        stats: stats[0],
      },
      { status: 200 },
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        success: false,
        error: e,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, admin_id } = await request.json();

    // 1. Update izin status
    await pool.execute(
      `UPDATE izin SET status = ?, approved_by = ? WHERE id = ?`,
      [status, admin_id, id]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Izin berhasil ${status}`,
      },
      { status: 200 },
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        success: false,
        error: e,
      },
      { status: 500 },
    );
  }
}
