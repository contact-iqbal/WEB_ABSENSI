import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { karyawan_id } = await request.json();

    // Get attendance stats for current month
    const [attendanceStats]: any = await pool.execute(
      `SELECT 
                COUNT(CASE WHEN status IN ('hadir', 'terlambat') THEN 1 END) as hadir,
                COUNT(CASE WHEN status = 'terlambat' THEN 1 END) as terlambat,
                COUNT(CASE WHEN status = 'izin' THEN 1 END) as izin,
                COUNT(CASE WHEN status = 'alpha' THEN 1 END) as alpha
             FROM absensi 
             WHERE id = ? AND MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE())`,
      [karyawan_id],
    );

    // Get recent attendance (last 5)
    const [recentAttendance] = await pool.execute(
      `SELECT * FROM absensi 
             WHERE id = ? 
             ORDER BY tanggal DESC, created_at DESC 
             LIMIT 5`,
      [karyawan_id],
    );

    // Calculate total working days in current month
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Rough estimate: exclude Sundays (approximately 4-5 days)
    const workingDays = daysInMonth - Math.floor(daysInMonth / 7);

    return NextResponse.json(
      {
        success: true,
        result: {
          hadir_bulan_ini: attendanceStats[0].hadir,
          terlambat: attendanceStats[0].terlambat,
          izin: attendanceStats[0].izin,
          alpha: attendanceStats[0].alpha,
          total_hari_kerja: workingDays,
          riwayat_terbaru: recentAttendance,
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
