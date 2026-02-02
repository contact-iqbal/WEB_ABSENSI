import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const karyawan_id = searchParams.get("karyawan_id");

    if (!karyawan_id) {
      return NextResponse.json(
        {
          success: false,
          message: "karyawan_id required",
        },
        { status: 400 },
      );
    }

    // Get salary history
    const [result]: any = await pool.execute(
      `SELECT g.*, 
                    (SELECT GROUP_CONCAT(CONCAT(jenis_tunjangan, ': Rp ', FORMAT(jumlah, 0)) SEPARATOR ', ') 
                     FROM tunjangan WHERE gaji_id = g.id) as detail_tunjangan,
                    (SELECT GROUP_CONCAT(CONCAT(jenis_potongan, ': Rp ', FORMAT(jumlah, 0)) SEPARATOR ', ') 
                     FROM potongan_gaji WHERE gaji_id = g.id) as detail_potongan
             FROM gaji g
             WHERE g.karyawan_id = ?
             ORDER BY g.tahun DESC, g.bulan DESC`,
      [karyawan_id],
    );

    // Get current month salary
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const currentSalary = result.find(
      (r: any) => r.bulan === currentMonth && r.tahun === currentYear,
    );

    return NextResponse.json(
      {
        success: true,
        result: {
          current: currentSalary || null,
          history: result,
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
