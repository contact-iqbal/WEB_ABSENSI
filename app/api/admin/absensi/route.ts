import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tanggal = searchParams.get("tanggal");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = `
            SELECT a.*, k.nama, k.jabatan, k.devisi 
            FROM absensi a 
            JOIN karyawan k ON a.id = k.id 
            WHERE 1=1
        `;
    const params: any[] = [];

    if (tanggal) {
      query += ` AND a.tanggal = ?`;
      params.push(tanggal);
    }

    if (status && status !== "Semua Status") {
      query += ` AND a.status = ?`;
      params.push(status.toLowerCase());
    }

    if (search) {
      query += ` AND k.nama LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY a.tanggal DESC, a.created_at DESC`;

    const [result] = await pool.execute(query, params);

    // Get statistics
    const [stats]: any = await pool.execute(`
            SELECT 
                COUNT(CASE WHEN status = 'hadir' THEN 1 END) as hadir,
                COUNT(CASE WHEN status = 'terlambat' THEN 1 END) as terlambat,
                COUNT(CASE WHEN status IN ('izin', 'sakit', 'alpha') THEN 1 END) as tidak_hadir
            FROM absensi
            WHERE tanggal = CURDATE()
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

export async function POST(request: NextRequest) {
  try {
    const {
      karyawan_id,
      tanggal,
      absen_masuk,
      absen_keluar,
      status,
      keterangan,
    } = await request.json();

    // Check if attendance already exists
    const [existing]: any = await pool.execute(
      "SELECT * FROM absensi WHERE id = ? AND tanggal = ?",
      [karyawan_id, tanggal],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Absensi untuk karyawan ini pada tanggal tersebut sudah ada",
        },
        { status: 400 },
      );
    }

    await pool.execute(
      `INSERT INTO absensi (id, tanggal, absen_masuk, absen_keluar, status, keterangan) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [karyawan_id, tanggal, absen_masuk, absen_keluar, status, keterangan],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Absensi berhasil dicatat",
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
    const {
      karyawan_id,
      tanggal,
      absen_masuk,
      absen_keluar,
      status,
      keterangan,
    } = await request.json();

    await pool.execute(
      `UPDATE absensi 
             SET absen_masuk = ?, absen_keluar = ?, status = ?, keterangan = ?
             WHERE id = ? AND tanggal = ?`,
      [absen_masuk, absen_keluar, status, keterangan, karyawan_id, tanggal],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Absensi berhasil diupdate",
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

export async function DELETE(request: NextRequest) {
  try {
    const { karyawan_id, tanggal } = await request.json();

    await pool.execute("DELETE FROM absensi WHERE id = ? AND tanggal = ?", [
      karyawan_id,
      tanggal,
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Absensi berhasil dihapus",
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
