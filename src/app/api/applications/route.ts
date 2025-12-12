import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortby") || "applied_date";
    const sortOrder = searchParams.get("sortOrder") || "DESC";

    let query = `
      SELECT 
        a.*,
        COUNT(DISTINCT i.id) as interview_count,
        COUNT(DISTINCT d.id) as document_count,
        COUNT(DISTINCT c.id) as contact_count
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      LEFT JOIN documents d ON a.id = d.application_id
      LEFT JOIN contacts c ON a.id = c.application_id
      WHERE a.user_id = $1
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: any[] = [user.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        LOWER(a.company_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(a.position_title) LIKE LOWER($${paramIndex})
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY a.id`;

    const validSortColumns = [
      "applied_date",
      "company_name",
      "position_title",
      "status",
      "priority",
    ];
    const validSortOrders = ["ASC", "DESC"];

    if (
      validSortColumns.includes(sortBy) &&
      validSortOrders.includes(sortOrder)
    ) {
      query += ` ORDER BY a.${sortBy} ${sortOrder}`;
    }

    const result = await pool.query(query, queryParams);

    return NextResponse.json({
      applications: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("Get applications error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      companyName,
      positionTitle,
      jobDescription,
      location,
      salaryRange,
      jobUrl,
      status = "applied",
      priority = "medium",
      appliedDate,
      followUpDate,
      notes,
    } = body;

    if (!companyName || !positionTitle || !appliedDate) {
      return NextResponse.json(
        { error: "Company name, position title and applied date are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO applications (
        user_id, company_name, position_title, job_description,
        location, salary_range, job_url, status, priority,
        applied_date, follow_up_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        user.id,
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
      ]
    );

    const application = result.rows[0];

    await pool.query(
      `INSERT INTO status_history (application_id, status, notes)
      VALUES ($1, $2, $3)`,
      [application.id, status, "Application created"]
    );

    return NextResponse.json(
      {
        message: "Application created successfully",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create application error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
