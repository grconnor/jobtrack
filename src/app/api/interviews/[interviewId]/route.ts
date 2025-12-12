import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// UPDATE interview
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await params;
    const interviewId = resolvedParams.interviewId;
    const body = await request.json();

    const interviewCheck = await pool.query(
      `SELECT i.* FROM interviews i
      JOIN applications a ON i.application_id = a.id
      WHERE i.id = $1 AND a.user_id = $2`,
      [interviewId, user.id]
    );

    if (interviewCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
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
      completed,
    } = body;

    const result = await pool.query(
      `UPDATE interviews SET
        interview_type = $1,
        scheduled_at = $2,
        duration_minutes = $3,
        location = $4,
        interviewer_names = $5,
        notes = $6,
        completed = $7
      WHERE id = $8
      RETURNING *`,
      [
        interviewType,
        scheduledAt,
        durationMinutes || null,
        location || null,
        interviewerNames || null,
        notes || null,
        completed || false,
        interviewId,
      ]
    );

    return NextResponse.json({
      message: "Interview updated successfully",
      interview: result.rows[0],
    });
  } catch (error) {
    console.error("Update interview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE interview
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await params;
    const interviewId = resolvedParams.interviewId;

    const interviewCheck = await pool.query(
      `SELECT i.id FROM interviews i
      JOIN applications a ON i.application_id = a.id
      WHERE i.id = $1 AND a.user_id = $2`,
      [interviewId, user.id]
    );

    if (interviewCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    await pool.query(`DELETE FROM interviews WHERE id = $1`, [interviewId]);

    return NextResponse.json({
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Delete interview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
