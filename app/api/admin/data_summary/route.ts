import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Total karyawan
    const [karyawanResult]: any = await pool.execute(
      'SELECT COUNT(*) AS total_karyawan FROM karyawan WHERE jabatan != "superadmin"',
    );

    // Hadir hari ini
    const [hadirResult]: any = await pool.execute(
      'SELECT COUNT(DISTINCT a.id) AS hadir_hari_ini FROM absensi a WHERE a.tanggal = CURDATE() AND a.status IN ("hadir", "terlambat")',
    );

    // Tidak hadir hari ini (total karyawan - yang hadir)
    const totalKaryawan = karyawanResult[0].total_karyawan;
    const hadirHariIni = hadirResult[0].hadir_hari_ini;
    const tidakHadirHariIni = totalKaryawan - hadirHariIni;

    // Total gaji bulan ini
    const [gajiResult]: any = await pool.execute(
      "SELECT COALESCE(SUM(gaji_bersih), 0) AS total_gaji FROM gaji WHERE bulan = MONTH(CURDATE()) AND tahun = YEAR(CURDATE())",
    );

    // Absensi terbaru (5 terakhir)
    const [absensiTerbaru]: any = await pool.execute(
      `SELECT a.*, k.nama, k.jabatan 
             FROM absensi a 
             JOIN karyawan k ON a.id = k.id 
             ORDER BY a.tanggal DESC, a.created_at DESC 
             LIMIT 5`,
    );

    // Aktivitas terkini (gabungan dari berbagai tabel)
    const [aktivitas]: any = await pool.execute(
      `SELECT 'absensi' AS tipe, k.nama, a.created_at AS waktu, 
                    CONCAT('Melakukan absensi ', a.status) AS aktivitas
             FROM absensi a
             JOIN karyawan k ON a.id = k.id
             WHERE DATE(a.created_at) = CURDATE()
             UNION ALL
             SELECT 'izin' AS tipe, k.nama, i.created_at AS waktu,
                    CONCAT('Mengajukan ', i.jenis_izin) AS aktivitas
             FROM izin i
             JOIN karyawan k ON i.karyawan_id = k.id
             WHERE DATE(i.created_at) = CURDATE()
             ORDER BY waktu DESC
             LIMIT 5`,
    );
    const [aktivitas_keluar]: any = await pool.execute(
      `SELECT 'pulang' AS tipe, k.nama, TIMESTAMP(DATE(a.created_at), a.absen_keluar) AS waktu, 
                    CONCAT('Melakukan ceklog pulang') AS aktivitas
             FROM absensi a
             JOIN karyawan k ON a.id = k.id
             WHERE DATE(a.created_at) = CURDATE() AND a.absen_keluar IS NOT NULL
             AND a.absen_keluar <> ''
             ORDER BY waktu DESC
             LIMIT 5`,
    );

    return NextResponse.json(
      {
        success: true,
        result: {
          karyawan: totalKaryawan,
          hadir_hari_ini: hadirHariIni,
          tidak_hadir_hari_ini: tidakHadirHariIni,
          total_gaji_bulan_ini: parseFloat(gajiResult[0].total_gaji),
          absensi_terbaru: absensiTerbaru,
          aktivitas_terkini: [{absen:aktivitas, keluar:aktivitas_keluar}],
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
