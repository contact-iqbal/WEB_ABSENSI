import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const karyawan_id = Number(body.karyawan_id);
    const bulan = body.bulan ? Number(body.bulan) : null;
    const tahun = body.tahun ? Number(body.tahun) : null;
    const status = body.status && body.status !== "Semua Status" ? String(body.status).toLowerCase() : null;
    const page = Number(body.page) || 1;
    const limit = Number(body.limit) || 10;
    const offset = (page - 1) * limit;

    // 1. Build Base Filter
    let filterSql = " WHERE id = ?";
    let filterParams: any[] = [karyawan_id];

    if (bulan) {
      filterSql += " AND MONTH(tanggal) = ?";
      filterParams.push(bulan);
    }
    if (tahun) {
      filterSql += " AND YEAR(tanggal) = ?";
      filterParams.push(tahun);
    }
    if (status) {
      filterSql += " AND status = ?";
      filterParams.push(status);
    }

    // 2. Get Total Count
    const countQuery = "SELECT COUNT(*) as total FROM absensi" + filterSql;
    const [countResult]: any = await pool.query(countQuery, filterParams);
    const total = countResult[0].total;

    // 3. Get Main Data
    const mainQuery = "SELECT * FROM absensi" + filterSql + " ORDER BY tanggal DESC LIMIT ? OFFSET ?";
    const mainParams = [...filterParams, limit, offset];
    const [result] = await pool.query(mainQuery, mainParams);

    // 4. Get Statistics (always for the selected month/year if provided)
    let statsSql = " WHERE id = ?";
    let statsParams: any[] = [karyawan_id];
    if (bulan) {
      statsSql += " AND MONTH(tanggal) = ?";
      statsParams.push(bulan);
    }
    if (tahun) {
      statsSql += " AND YEAR(tanggal) = ?";
      statsParams.push(tahun);
    }

    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN status IN ('hadir', 'terlambat') THEN 1 END) as hadir,
        COUNT(CASE WHEN status = 'terlambat' THEN 1 END) as terlambat,
        COUNT(CASE WHEN status = 'izin' THEN 1 END) as izin,
        COUNT(CASE WHEN status = 'sakit' THEN 1 END) as sakit,
        COUNT(CASE WHEN status = 'alpha' THEN 1 END) as alpha
      FROM absensi ${statsSql}
    `;
    const [statsResult]: any = await pool.query(statsQuery, statsParams);

    return NextResponse.json(
      {
        success: true,
        result: result,
        stats: statsResult[0],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (e: any) {
    console.error('Database Error:', e);
    return NextResponse.json(
      {
        success: false,
        message: e.message,
        error: e,
      },
      { status: 500 },
    );
  }
}
