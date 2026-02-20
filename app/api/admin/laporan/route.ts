import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { type, bulan, tahun } = await request.json();
    let query = "";
    let params: any[] = [];

    if (type === "absensi") {
      query = `
        SELECT 
          k.nama, k.jabatan, k.devisi,
          a.tanggal, a.absen_masuk, a.absen_keluar, a.status, a.keterangan
        FROM absensi a
        JOIN karyawan k ON a.id = k.id
        WHERE MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?
        ORDER BY a.tanggal DESC, k.nama ASC
      `;
      params = [bulan, tahun];
    } else if (type === "gaji") {
      query = `
        SELECT 
          k.nama, k.jabatan, k.devisi,
          g.bulan, g.tahun, g.gaji_pokok, g.total_tunjangan, g.total_potongan, g.gaji_bersih, g.status_bayar, g.tanggal_bayar
        FROM gaji g
        JOIN karyawan k ON g.karyawan_id = k.id
        WHERE g.bulan = ? AND g.tahun = ?
        ORDER BY k.nama ASC
      `;
      params = [bulan, tahun];
    } else if (type === "karyawan") {
      query = `
        SELECT 
          nama, NIK, tempat_lahir, tanggal_lahir, jenis_kel, agama, 
          jabatan, devisi, status, email, no_telp, alamat, 
          gaji_pokok, acc_created as tanggal_bergabung
        FROM karyawan
        WHERE jabatan != 'superadmin'
        ORDER BY nama ASC
      `;
      params = [];
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid report type" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(query, params);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        success: false,
        error: e,
      },
      { status: 500 }
    );
  }
}
