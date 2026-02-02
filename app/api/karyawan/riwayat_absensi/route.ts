import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      karyawan_id,
      bulan,
      tahun,
      status,
      page = 1,
      limit = 10,
    } = await request.json();

    let query = `
            SELECT * FROM absensi 
            WHERE id = ?
        `;
    const params: any[] = [karyawan_id];

    if (bulan) {
      query += ` AND MONTH(tanggal) = ?`;
      params.push(bulan);
    }

    if (tahun) {
      query += ` AND YEAR(tanggal) = ?`;
      params.push(tahun);
    }

    if (status && status !== "Semua Status") {
      query += ` AND status = ?`;
      params.push(status.toLowerCase());
    }

    query += ` ORDER BY tanggal DESC`;

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total");
    const [countResult]: any = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [result] = await pool.execute(query, params);

    // Get statistics for the selected period
    let statsQuery = `
            SELECT 
                COUNT(CASE WHEN status IN ('hadir', 'terlambat') THEN 1 END) as hadir,
                COUNT(CASE WHEN status = 'terlambat' THEN 1 END) as terlambat,
                COUNT(CASE WHEN status = 'izin' THEN 1 END) as izin,
                COUNT(CASE WHEN status = 'sakit' THEN 1 END) as sakit,
                COUNT(CASE WHEN status = 'alpha' THEN 1 END) as alpha
            FROM absensi 
            WHERE id = ?
        `;
    const statsParams: any[] = [karyawan_id];

    if (bulan) {
      statsQuery += ` AND MONTH(tanggal) = ?`;
      statsParams.push(bulan);
    }

    if (tahun) {
      statsQuery += ` AND YEAR(tanggal) = ?`;
      statsParams.push(tahun);
    }

    const [stats]: any = await pool.execute(statsQuery, statsParams);

    return NextResponse.json(
      {
        success: true,
        result: result,
        stats: stats[0],
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
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
