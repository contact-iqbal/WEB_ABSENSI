import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = `
            SELECT g.*, k.nama, k.jabatan, k.devisi
            FROM gaji g
            JOIN karyawan k ON g.karyawan_id = k.id
            WHERE 1=1
        `;
    const params: any[] = [];

    if (bulan) {
      query += ` AND g.bulan = ?`;
      params.push(bulan);
    }

    if (tahun) {
      query += ` AND g.tahun = ?`;
      params.push(tahun);
    }

    if (status && status !== "Semua Status") {
      query += ` AND g.status_bayar = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND k.nama LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY g.tahun DESC, g.bulan DESC, g.created_at DESC`;

    const [result] = await pool.execute(query, params);

    // Get statistics
    const currentMonth = bulan || new Date().getMonth() + 1;
    const currentYear = tahun || new Date().getFullYear();

    const [stats]: any = await pool.execute(
      `
            SELECT 
                COALESCE(SUM(gaji_bersih), 0) as total_gaji,
                COALESCE(SUM(CASE WHEN status_bayar = 'sudah_dibayar' THEN gaji_bersih ELSE 0 END), 0) as sudah_dibayar,
                COALESCE(SUM(CASE WHEN status_bayar = 'belum_dibayar' THEN gaji_bersih ELSE 0 END), 0) as belum_dibayar,
                COALESCE(SUM(total_potongan), 0) as total_potongan
            FROM gaji
            WHERE bulan = ? AND tahun = ?
        `,
      [currentMonth, currentYear],
    );

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

export async function POST(request: NextRequest) {
  try {
    const { action, bulan, tahun } = await request.json();

    if (action === "hitung_otomatis") {
      // Get all employees
      const [karyawan]: any = await pool.execute(
        'SELECT id, gaji_pokok FROM karyawan WHERE jabatan != "superadmin"',
      );

      // Calculate salary for each employee
      for (const k of karyawan) {
        // Check if salary already exists
        const [existing]: any = await pool.execute(
          "SELECT id FROM gaji WHERE karyawan_id = ? AND bulan = ? AND tahun = ?",
          [k.id, bulan, tahun],
        );

        if (existing.length > 0) {
          continue; // Skip if already exists
        }

        // Count attendance
        const [attendance]: any = await pool.execute(
          `SELECT 
                        COUNT(CASE WHEN status IN ('hadir', 'terlambat') THEN 1 END) as hadir,
                        COUNT(CASE WHEN status = 'alpha' THEN 1 END) as alpha
                     FROM absensi 
                     WHERE id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`,
          [k.id, bulan, tahun],
        );

        const hadirCount = attendance[0].hadir;
        const alphaCount = attendance[0].alpha;

        // Simple calculation: gaji_pokok - (alpha * 100000)
        const potongan_alpha = alphaCount * 100000;
        const gaji_bersih = k.gaji_pokok - potongan_alpha;

        // Insert salary record
        const [gajiResult]: any = await pool.execute(
          `INSERT INTO gaji (karyawan_id, bulan, tahun, gaji_pokok, total_tunjangan, total_potongan, gaji_bersih, status_bayar)
                     VALUES (?, ?, ?, ?, 0, ?, ?, 'belum_dibayar')`,
          [k.id, bulan, tahun, k.gaji_pokok, potongan_alpha, gaji_bersih],
        );

        // Add potongan if any
        if (potongan_alpha > 0) {
          await pool.execute(
            `INSERT INTO potongan_gaji (gaji_id, jenis_potongan, jumlah, keterangan)
                         VALUES (?, 'Potongan Alpha', ?, ?)`,
            [gajiResult.insertId, potongan_alpha, `${alphaCount} hari alpha`],
          );
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: `Gaji untuk ${karyawan.length} karyawan berhasil dihitung`,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Action tidak valid",
      },
      { status: 400 },
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
    const { id, status_bayar, tanggal_bayar } = await request.json();

    await pool.execute(
      `UPDATE gaji 
             SET status_bayar = ?, tanggal_bayar = ?
             WHERE id = ?`,
      [status_bayar, tanggal_bayar, id],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Status pembayaran berhasil diupdate",
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
