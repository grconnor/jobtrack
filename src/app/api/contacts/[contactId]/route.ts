import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// UPDATE contact
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { contactId } = await params;
    const body = await request.json();

    const contactCheck = await pool.query(
      `SELECT c.* FROM contacts c
      JOIN applications a ON c.application_id = a.id
      WHERE c.id = $1 AND a.user_id = $2`,
      [contactId, user.id]
    );

    if (contactCheck.rows.length === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const { name, role, email, phone, linkedinUrl, notes } = body;

    const result = await pool.query(
      `UPDATE contacts SET
        name = $1,
        role = $2,
        email = $3,
        phone = $4,
        linkedin_url = $5,
        notes = $6
      WHERE id = $7
      RETURNING *`,
      [
        name,
        role || null,
        email || null,
        phone || null,
        linkedinUrl || null,
        notes || null,
        contactId,
      ]
    );

    return NextResponse.json({
      message: "Contact updated successfully",
      contact: result.rows[0],
    });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { contactId } = await params;

    const contactCheck = await pool.query(
      `SELECT c.id FROM contacts c
      JOIN applications a ON c.application_id = a.id
      WHERE c.id = $1 AND a.user_id = $2`,
      [contactId, user.id]
    );

    if (contactCheck.rows.length === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    await pool.query(`DELETE FROM contacts WHERE id = $1`, [contactId]);

    return NextResponse.json({
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
