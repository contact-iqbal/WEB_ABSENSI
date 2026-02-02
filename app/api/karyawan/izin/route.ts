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

    const [result] = await pool.execute(
      `SELECT i.*, 
                    (SELECT nama FROM karyawan WHERE id = i.approved_by) as approved_by_nama
             FROM izin i
             WHERE i.karyawan_id = ?
             ORDER BY i.created_at DESC`,
      [karyawan_id],
    );

    return NextResponse.json(
      {
        success: true,
        result: result,
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
      jenis_izin,
      tanggal_mulai,
      tanggal_selesai,
      keterangan,
      bukti,
    } = await request.json();

    await pool.execute(
      `INSERT INTO izin (karyawan_id, jenis_izin, tanggal_mulai, tanggal_selesai, keterangan, bukti, status)
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        karyawan_id,
        jenis_izin,
        tanggal_mulai,
        tanggal_selesai,
        keterangan,
        bukti,
      ],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Pengajuan izin berhasil dikirim",
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
    const { id, action, approved_by } = await request.json();

    if (action === "cancel") {
      // Only allow cancel if status is pending
      await pool.execute(
        `UPDATE izin SET status = 'ditolak' WHERE id = ? AND status = 'pending'`,
        [id],
      );
    } else if (action === "approve") {
      await pool.execute(
        `UPDATE izin SET status = 'disetujui', approved_by = ? WHERE id = ?`,
        [approved_by, id],
      );
    } else if (action === "reject") {
      await pool.execute(
        `UPDATE izin SET status = 'ditolak', approved_by = ? WHERE id = ?`,
        [approved_by, id],
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Status izin berhasil diupdate",
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
