import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

const SECRET_KEY = process.env.JWT_SECRET || "V2ViIEFic2VuIEROQSBwYWtlIG5leHRqcyBjaWh1eXl5eXk=";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: any;
    };
    const [type] = await pool.query<RowDataPacket[]>('SELECT type, username FROM users WHERE id = ?', [decoded.id])
    const restriction = type[0]
    return NextResponse.json({
      success: true,
      userId: decoded.id,
      username: type[0].username,
      accountAccess: restriction.type
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
