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

    const viewDate = tanggal || new Date().toISOString().split('T')[0];

    // 1. Automatic Izin Realization
    // Find people who have approved izin for the viewed date but no absensi record yet
    const [approvedIzin]: any = await pool.execute(`
      SELECT i.karyawan_id, i.jenis_izin, i.keterangan 
      FROM izin i
      WHERE i.status = 'disetujui'
      AND ? BETWEEN i.tanggal_mulai AND i.tanggal_selesai
      AND i.karyawan_id NOT IN (SELECT id FROM absensi WHERE tanggal = ?)
    `, [viewDate, viewDate]);

    for (const item of approvedIzin) {
      await pool.execute(
        "INSERT INTO absensi (id, tanggal, status, keterangan) VALUES (?, ?, ?, ?)",
        [item.karyawan_id, viewDate, item.jenis_izin, `${item.jenis_izin}: ${item.keterangan}`]
      );
    }

    // 2. Automatic Alpha Check (Only for today)
    if (viewDate === new Date().toISOString().split('T')[0]) {
      const [config]: any = await pool.execute('SELECT jam_pulang FROM config LIMIT 1');
      const jamPulang = config[0]?.jam_pulang || '17:00:00';
      const now = new Date();
      const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const [hPulang, mPulang, sPulang] = jamPulang.split(':').map(Number);
      const pulangTime = hPulang * 3600 + mPulang * 60 + sPulang;

      if (currentTime >= pulangTime) {
        // Get all employees who don't have attendance today
        const [missingEmployees]: any = await pool.execute(`
          SELECT k.id FROM karyawan k
          WHERE k.jabatan != 'superadmin'
          AND k.id NOT IN (SELECT id FROM absensi WHERE tanggal = CURDATE())
        `);

        for (const employee of missingEmployees) {
          await pool.execute(
            "INSERT INTO absensi (id, tanggal, status, keterangan) VALUES (?, CURDATE(), 'alpha', 'Alpa (Otomatis)')",
            [employee.id]
          );
        }
      }
    }

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
      override
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
    if (override.length > 0) {
      let absn_klr
      if (absen_keluar === ''){
        absn_klr = null
      } else {
        absn_klr = absen_keluar
      }
      await pool.execute(
        `INSERT INTO absensi (id, tanggal, absen_masuk, absen_keluar, status, keterangan, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [karyawan_id, tanggal, absen_masuk, absn_klr, status, keterangan, override],
      );
    } else {
      await pool.execute(
        `INSERT INTO absensi (id, tanggal, absen_masuk, absen_keluar, status, keterangan) 
             VALUES (?, ?, ?, ?, ?, ?)`,
        [karyawan_id, tanggal, absen_masuk, absen_keluar, status, keterangan],
      );
    }

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
