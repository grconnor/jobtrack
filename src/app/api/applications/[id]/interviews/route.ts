import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET all interviews for an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const appCheck = await pool.query(
      `SELECT id FROM applications WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    if (appCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM interviews WHERE application_id = $1 ORDER BY scheduled_at ASC`,
      [id]
    );

    return NextResponse.json({ interviews: result.rows });
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE interview
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const appCheck = await pool.query(
      `SELECT id FROM applications WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    if (appCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const {
      interviewType,
      scheduledAt,
      durationMinutes,
      location,
      interviewerNames,
      notes,
    } = body;

    if (!interviewType || !scheduledAt) {
      return NextResponse.json(
        { error: "Interview type and scheduled time are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO interviews (
        application_id, interview_type, scheduled_at, 
        duration_minutes, location, interviewer_names, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        interviewType,
        scheduledAt,
        durationMinutes || null,
        location || null,
        interviewerNames || null,
        notes || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Interview created successfully",
        interview: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create interview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
