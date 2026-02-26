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
    const calculated: any = await pool.execute(query, params)
    const iscalculated = calculated[0].length > 1

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
        iscalculated: iscalculated,
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
      // Check if there are any attendance records for this month/year first
      const [checkAttendance]: any = await pool.execute(
        'SELECT COUNT(*) as count FROM absensi WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?',
        [bulan, tahun]
      );

      if (checkAttendance[0].count === 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Tidak ada data absensi untuk bulan ke ${bulan}, tahun ${tahun}. Kalkulasi gaji tidak dapat dilakukan.`,
          },
          { status: 400 }
        );
      }

      // Get only employees who have attendance records for this specific month/year
      const [karyawan]: any = await pool.execute(
        `SELECT DISTINCT k.id, k.gaji_pokok FROM karyawan k
         JOIN absensi a ON k.id = a.id
         WHERE k.jabatan != "superadmin"
         AND MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?`,
        [bulan, tahun]
      );

      // Get config for calculation
      const [config]: any = await pool.execute('SELECT jam_masuk, toleransi_telat, tunjangan_makan, tunjangan_transport, potongan_alpha, potongan_terlambat, toleransi_potongan_terlambat, upah_lembur FROM config LIMIT 1');
      const jamMasukConfig = config[0]?.jam_masuk || '08:00:00';
      const toleransiTelat = config[0]?.toleransi_telat || 0;
      const tunjanganMakanPerHari = config[0]?.tunjangan_makan || 0;
      const tunjanganTransportPerHari = config[0]?.tunjangan_transport || 0;
      const potonganAlphaPerHari = config[0]?.potongan_alpha || 0;
      const potonganTerlambatPerMenit = config[0]?.potongan_terlambat || 0;
      const ToleransipotonganTerlambatPerMenit = config[0]?.toleransi_potongan_terlambat || 0;
      const toleransipotongan = ToleransipotonganTerlambatPerMenit / 100
      const upahgaji = config[0]?.upah_lembur

      // Calculate salary for each employee
      for (const k of karyawan) {
        // Check if salary already exists
        const [existing]: any = await pool.execute(
          "SELECT id, status_bayar FROM gaji WHERE karyawan_id = ? AND bulan = ? AND tahun = ?",
          [k.id, bulan, tahun],
        );

        if (existing.length > 0) {
          if (existing[0].status_bayar === 'sudah_dibayar') {
            continue; // Skip if already paid
          } else {
            // Delete existing unpaid record to allow recalculation
            await pool.execute("DELETE FROM gaji WHERE id = ?", [existing[0].id]);
          }
        }

        // Fetch all attendance for the month to calculate deductions and allowances
        const [attendanceRecords]: any = await pool.execute(
          `SELECT status, absen_masuk FROM absensi 
           WHERE id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`,
          [k.id, bulan, tahun],
        );

        let alphaCount = 0;
        let totalPotonganTerlambat = 0;
        let terlambatCount = 0;
        let daysPresent = 0;

        attendanceRecords.forEach((record: any) => {
          if (record.status === 'alpha') {
            alphaCount++;
          } else if (record.status === 'hadir' || record.status === 'terlambat') {
            daysPresent++;
            if (record.status === 'terlambat' && record.absen_masuk) {
              const [hConfig, mConfig] = jamMasukConfig.split(':').map(Number);
              const [hAbsen, mAbsen] = record.absen_masuk.split(':').map(Number);

              const minutesConfig = hConfig * 60 + (mConfig + Number(toleransiTelat));
              const minutesAbsen = hAbsen * 60 + mAbsen;
              const minutesLate = minutesAbsen - minutesConfig;

              const tolreansi = 5 // ini menit, jadi toleransi 5 menit keatas di kurangi 5% / terserah yang di config

              if (minutesLate > 0) {
                terlambatCount++;
                if (minutesLate > tolreansi) {
                  const finalpersen = minutesLate * potonganTerlambatPerMenit * toleransipotongan;
                  totalPotonganTerlambat += minutesLate * potonganTerlambatPerMenit - finalpersen;
                } else {
                  totalPotonganTerlambat += minutesLate * potonganTerlambatPerMenit;
                }
              }
            }
          }
        });

        if (totalPotonganTerlambat > k.gaji_pokok) {
          totalPotonganTerlambat = k.gaji_pokok
        }

        // cek lembur ygy
        const [lemburcheck]: any = await pool.execute(
          'SELECT * FROM izin WHERE jenis_izin = "lembur" AND status = "disetujui" AND karyawan_id = ?',
          [k.id]
        )

        let upah_lembur = 0;
        let berapajamlembur = '';

        lemburcheck.forEach((ada: any) => {
          const [hLemburM, mLemburM] = ada.lembur_mulai.split(':').map(Number);
          const [hLemburS, mLemburS] = ada.lembur_selesai.split(':').map(Number);
          const mulailemburinsecond = hLemburM * 3600 + mLemburM * 60
          const selesailemburinsecond = hLemburS * 3600 + mLemburS * 60
          function secondsToHms(totalSeconds: number) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            // Pad with leading zeros if necessary
            const formatTwoDigits = (num: number) => num.toString().padStart(2, '0');

            return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`;
          }
          function calculateTimeDifference(startTime: any, endTime: any) {
            const startSeconds = startTime;
            const endSeconds = endTime;

            const differenceSeconds = endSeconds - startSeconds;

            // Handle cases where the time difference might be negative (e.g., crossing midnight)
            if (differenceSeconds < 0) {
              // Treat as if it crosses midnight (add 24 hours in seconds)
              const secondsInADay = 24 * 3600;
              return secondsToHms(differenceSeconds + secondsInADay);
            }

            return secondsToHms(differenceSeconds);
          }
          berapajamlembur = calculateTimeDifference(mulailemburinsecond, selesailemburinsecond)
          const [lemburjamh, lemburjamm] = berapajamlembur.split(':').map(Number)
          upah_lembur = lemburjamh * upahgaji + Math.ceil(lemburjamm / 60 * upahgaji)
        });

        const totalTunjanganMakan = daysPresent * tunjanganMakanPerHari;
        const totalTunjanganTransport = daysPresent * tunjanganTransportPerHari;
        const total_tunjangan = totalTunjanganMakan + totalTunjanganTransport + upah_lembur;

        const totalPotonganAlpha = alphaCount * potonganAlphaPerHari;
        let total_potongan = totalPotonganAlpha + totalPotonganTerlambat;

        // Ensure total deductions don't exceed base salary (prevent negative net salary)
        if (total_potongan > k.gaji_pokok) {
          total_potongan = k.gaji_pokok;
        }

        const gaji_bersih = k.gaji_pokok + total_tunjangan - total_potongan;

        // Insert salary record
        const [gajiResult]: any = await pool.execute(
          `INSERT INTO gaji (karyawan_id, bulan, tahun, gaji_pokok, total_tunjangan, total_potongan, gaji_bersih, status_bayar)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'belum_dibayar')`,
          [k.id, bulan, tahun, k.gaji_pokok, total_tunjangan, total_potongan, gaji_bersih],
        );

        // Add tunjangan records
        if (totalTunjanganMakan > 0) {
          await pool.execute(
            `INSERT INTO tunjangan (gaji_id, jenis_tunjangan, jumlah, keterangan)
                         VALUES (?, 'Tunjangan Makan', ?, ?)`,
            [gajiResult.insertId, totalTunjanganMakan, `${daysPresent} hari kerja`],
          );
        }
        if (totalTunjanganTransport > 0) {
          await pool.execute(
            `INSERT INTO tunjangan (gaji_id, jenis_tunjangan, jumlah, keterangan)
                         VALUES (?, 'Tunjangan Transport', ?, ?)`,
            [gajiResult.insertId, totalTunjanganTransport, `${daysPresent} hari kerja`],
          );
        }
        if (upah_lembur > 0) {
          await pool.execute(
            `INSERT INTO tunjangan (gaji_id, jenis_tunjangan, jumlah, keterangan) 
                        VALUES (?, 'Upah Lembur', ?, ?)`,
            [gajiResult.insertId, upah_lembur, `Lembur selama ${berapajamlembur}`]
          )
        }

        if (totalPotonganAlpha > 0) {
          await pool.execute(
            `INSERT INTO potongan_gaji (gaji_id, jenis_potongan, jumlah, keterangan)
                         VALUES (?, 'Potongan Alpha', ?, ?)`,
            [gajiResult.insertId, totalPotonganAlpha, `${alphaCount} hari alpha`],
          );
        }

        if (totalPotonganTerlambat > 0) {
          await pool.execute(
            `INSERT INTO potongan_gaji (gaji_id, jenis_potongan, jumlah, keterangan)
                         VALUES (?, 'Potongan Terlambat', ?, ?)`,
            [gajiResult.insertId, totalPotonganTerlambat, `${terlambatCount} kali terlambat`],
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
