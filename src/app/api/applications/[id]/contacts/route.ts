import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET all contacts for an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = await resolvedParams.id;

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
      `SELECT * FROM contacts WHERE application_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({ contacts: result.rows });
  } catch (error) {
    console.error("Get contacts error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
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

    const { name, role, email, phone, linkedinUrl, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Contact name is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO contacts (application_id, name, role, email, phone, linkedin_url, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        name,
        role || null,
        email || null,
        phone || null,
        linkedinUrl || null,
        notes || null,
      ]
    );

    return NextResponse.json(
      {
        message: "Contact created successfully",
        contact: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create contact error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
