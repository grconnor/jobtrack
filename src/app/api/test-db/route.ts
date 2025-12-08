import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");
    return NextResponse.json({
      success: true,
      time: result.rows[0],
      message: "Database connection successful",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Database connection error: ", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 }
    );
  }
}
