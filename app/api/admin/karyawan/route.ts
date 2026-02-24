import { hashPassword } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { json } from "stream/consumers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const devisi = searchParams.get("devisi");
    const search = searchParams.get("search");

    let query = `SELECT * FROM karyawan WHERE jabatan != "superadmin"`
    const params: any[] = [];

    if (search) {
      query += ` AND nama LIKE ?`;
      params.push(`%${search}%`);
    }
    if (devisi && devisi != '-') {
      query += ` AND devisi = ?`;
      params.push(`${devisi}`);
    }
    const [result] = await pool.execute(
      query,params
    );
    return NextResponse.json(
      {
        success: true,
        debug: {query: query, params: params, devisi: devisi},
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
    const requestBody = await request.json();
    console.log("--- DEBUG: Incoming POST request body ---", requestBody);
    const {
      id,
      action,
      value,
      username,
      password,
      nama,
      jabatan,
      devisi,
      status,
      NIK,
      tempat_lahir,
      tanggal_lahir,
      jenis_kel,
      agama,
      alamat,
      email,
      no_telp,
      gaji_pokok,
    } = requestBody;

    if (action == "create") {
      const body = { username, password, nama, jabatan, devisi, status, NIK, tempat_lahir, tanggal_lahir, jenis_kel, agama, alamat, email, no_telp, gaji_pokok };
      console.log("--- DEBUG: Received raw body for create action ---");
      console.log(body);

      // Check for required fields
      if (!username || !password) {
        return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 });
      }
      
      // Check if username already exists
      const [existingUser]: any = await pool.execute(
        "SELECT id FROM users WHERE username = ?",
        [username],
      );

      if (existingUser.length > 0) {
        return NextResponse.json(
          { success: false, message: "Username sudah digunakan" },
          { status: 400 },
        );
      }

      // Sanitize and set defaults
      const s_nama = nama || username;
      let s_jabatan = jabatan || 'karyawan';
      let s_devisi = devisi || 'default';
      let s_status = status || 'default';
      const s_NIK = NIK || 0;
      const s_tempat_lahir = tempat_lahir || null;
      const s_tanggal_lahir = tanggal_lahir || null;
      const s_jenis_kel = jenis_kel || 'default';
      const s_agama = agama || 'default';
      const s_alamat = alamat || null;
      const s_email = email || null;
      const s_no_telp = no_telp || null;
      const s_gaji_pokok = gaji_pokok || 0;
      if (s_devisi === 'DNA Jaya Group') {
        s_devisi = 'DNA'
      } else if (s_devisi === 'Rizqi Tour') {
        s_devisi = 'RT'
      } else {
        s_devisi = 'default'
      }
      s_jabatan = String(s_jabatan).toLowerCase()
      s_status = String(s_status).toLowerCase().replaceAll(' ', "_")
      
      const sanitized_data = {s_nama, s_jabatan, s_devisi, s_status, s_NIK, s_tempat_lahir, s_tanggal_lahir, s_jenis_kel, s_agama, s_alamat, s_email, s_no_telp, s_gaji_pokok};
      console.log("--- DEBUG: Sanitized data before insert ---");
      console.log(sanitized_data);

      // Hash password
      // const hashedPassword = await hashPassword(password);
      let hashedPassword
      if (String(password).startsWith('$')) {
        console.log('password already hashed using original')
        hashedPassword = password
      } else {
        console.log('password not hashed, hashing')
        hashedPassword = await hashPassword(password);
      }

      // Insert into users table
      const [userResult]: any = await pool.execute(
        "INSERT INTO users (username, password, type) VALUES (?, ?, ?)",
        [username, hashedPassword, "pegawai"],
      );

      const newUserId = userResult.insertId;
      console.log(`--- DEBUG: Created user with ID: ${newUserId} ---`);

      // Insert into karyawan table
      try {
        await pool.execute(
          `INSERT INTO karyawan (id, nama, jabatan, devisi, status, NIK, tempat_lahir, tanggal_lahir, jenis_kel, agama, alamat, email, no_telp, gaji_pokok) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newUserId, s_nama, s_jabatan, s_devisi, s_status, s_NIK, s_tempat_lahir, s_tanggal_lahir, s_jenis_kel, s_agama, s_alamat, s_email, s_no_telp, s_gaji_pokok],
        );
        console.log(`--- DEBUG: Successfully inserted data into karyawan for ID: ${newUserId} ---`);
      } catch (dbError) {
        console.error("--- DATABASE ERROR on karyawan insert ---", dbError);
        // Optionally, delete the user that was just created to avoid orphaned users
        await pool.execute("DELETE FROM users WHERE id = ?", [newUserId]);
        console.log(`--- DEBUG: Rolled back user creation for ID: ${newUserId} ---`);
        return NextResponse.json({ error: "Database error inserting employee data.", details: dbError }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Karyawan berhasil ditambahkan",
      });
    }

    if (action == "update") {
      if (!id && !value && id != 1) {
        return NextResponse.json(
          {
            success: false,
            error: "Update dibatalkan karena isi kosong atau id = 1",
          },
          { status: 400 },
        );
      }
      if (id && value.nama) {
        await pool.execute(`UPDATE karyawan SET nama = ? WHERE id = ?`, [
          value.nama,
          id,
        ]);
      }
      if (id && value.devisi) {
        await pool.execute(`UPDATE karyawan SET devisi = ? WHERE id = ?`, [
          value.devisi,
          id,
        ]);
      }
      if (id && value.jabatan) {
        await pool.execute(`UPDATE karyawan SET jabatan = ? WHERE id = ?`, [
          value.jabatan,
          id,
        ]);
      }
      if (id && value.status) {
        await pool.execute(`UPDATE karyawan SET status = ? WHERE id = ?`, [
          value.status,
          id,
        ]);
      }
      if (id && value.jenis_kel) {
        await pool.execute(`UPDATE karyawan SET jenis_kel = ? WHERE id = ?`, [
          value.jenis_kel,
          id,
        ]);
      }
      if (id && value.agama) {
        await pool.execute(`UPDATE karyawan SET agama = ? WHERE id = ?`, [
          value.agama,
          id,
        ]);
      }
      if (id && value.tempat_lahir) {
        await pool.execute(`UPDATE karyawan SET tempat_lahir = ? WHERE id = ?`, [
          value.tempat_lahir,
          id,
        ]);
      }
      if (id && value.tanggal_lahir) {
        await pool.execute(`UPDATE karyawan SET tanggal_lahir = STR_TO_DATE(?,'%Y-%m-%dT%H:%i:%s.000Z') WHERE id = ?`, [
          value.tanggal_lahir,
          id,
        ]);
      }
      if (id && value.alamat) {
        await pool.execute(`UPDATE karyawan SET alamat = ? WHERE id = ?`, [
          value.alamat,
          id,
        ]);
      }
      if (id && value.email) {
        await pool.execute(`UPDATE karyawan SET email = ? WHERE id = ?`, [
          value.email,
          id,
        ]);
      }
      if (id && value.no_telp) {
        await pool.execute(`UPDATE karyawan SET no_telp = ? WHERE id = ?`, [
          value.no_telp,
          id,
        ]);
      }
      if (id && value.NIK) {
        await pool.execute(`UPDATE karyawan SET NIK = ? WHERE id = ?`, [
          value.NIK,
          id,
        ]);
      }
      if (id && value.gaji_pokok) {
        await pool.execute(`UPDATE karyawan SET gaji_pokok = ? WHERE id = ?`, [
          value.gaji_pokok,
          id,
        ]);
      }
      if (id && value.profile_picture) {
        await pool.execute(`UPDATE karyawan SET profile_picture = ? WHERE id = ?`, [
          value.profile_picture,
          id,
        ]);
      }
      return NextResponse.json({
        success: true,
        message: "Berhasil Mengupdate!",
      });
    }
  } catch (error) {
    console.error("error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
