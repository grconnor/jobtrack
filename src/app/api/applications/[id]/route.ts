import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET single application by ID
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
    console.log("id: ", id)

    const applicationResult = await pool.query(
      `SELECT * FROM applications WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    if (applicationResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const application = applicationResult.rows[0];

    const statusHistoryResult = await pool.query(
      `SELECT * FROM status_history 
      WHERE application_id = $1 
      ORDER BY changed_at DESC`,
      [id]
    );

    const contactsResult = await pool.query(
      `SELECT * FROM contacts 
      WHERE application_id = $1 
      ORDER BY created_at DESC`,
      [id]
    );

    const documentsResult = await pool.query(
      `SELECT * FROM documents 
      WHERE application_id = $1 
      ORDER BY uploaded_at DESC`,
      [id]
    );

    const interviewsResult = await pool.query(
      `SELECT * FROM interviews 
      WHERE application_id = $1 
      ORDER BY scheduled_at ASC`,
      [id]
    );

    return NextResponse.json({
      application,
      statusHistory: statusHistoryResult.rows,
      contacts: contactsResult.rows,
      documents: documentsResult.rows,
      interviews: interviewsResult.rows,
    });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE application
export async function PUT(
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

    const existingResult = await pool.query(
      `SELECT * FROM applications WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const existingApplication = existingResult.rows[0];

    const {
      companyName,
      positionTitle,
      jobDescription,
      location,
      salaryRange,
      jobUrl,
      status,
      priority,
      appliedDate,
      followUpDate,
      notes,
    } = body;

    const result = await pool.query(
      `UPDATE applications SET
        company_name = $1,
        position_title = $2,
        job_description = $3,
        location = $4,
        salary_range = $5,
        job_url = $6,
        status = $7,
        priority = $8,
        applied_date = $9,
        follow_up_date = $10,
        notes = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND user_id = $13
      RETURNING *`,
      [
        companyName,
        positionTitle,
        jobDescription || null,
        location || null,
        salaryRange || null,
        jobUrl || null,
        status,
        priority,
        appliedDate,
        followUpDate || null,
        notes || null,
        id,
        user.id,
      ]
    );

    if (status !== existingApplication.status) {
      await pool.query(
        `INSERT INTO status_history (application_id, status, notes)
        VALUES ($1, $2, $3)`,
        [
          id,
          status,
          `Status changed from ${existingApplication.status} to ${status}`,
        ]
      );
    }

    return NextResponse.json({
      message: "Application updated successfully",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const existingResult = await pool.query(
      `SELECT id FROM applications WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    await pool.query(
      `DELETE FROM applications WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    );

    return NextResponse.json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
