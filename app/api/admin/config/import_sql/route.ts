import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req:NextRequest) {
    try {
    const formData = await req.formData();
    const file = formData.get("sqlFile") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const sql = await file.text();

    await pool.query(sql);


    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}