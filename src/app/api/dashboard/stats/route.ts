import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM applications WHERE user_id = $1`,
      [user.id]
    );

    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count 
      FROM applications 
      WHERE user_id = $1 
      GROUP BY status`,
      [user.id]
    );

    const byStatus: any = {
      applied: 0,
      phone_screen: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };

    statusResult.rows.forEach((row) => {
      byStatus[row.status] = parseInt(row.count);
    });

    const recentResult = await pool.query(
      `SELECT * FROM applications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5`,
      [user.id]
    );

    const upcomingInterviewsResult = await pool.query(
      `SELECT i.*, a.company_name, a.position_title
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        WHERE a.user_id = $1 
          AND i.scheduled_at >= NOW()
          AND i.scheduled_at <= NOW() + INTERVAL '7 days'
          AND i.completed = false
        ORDER BY i.scheduled_at ASC`,
      [user.id]
    );

    const applicationsByMonthResult = await pool.query(
      `SELECT 
        TO_CHAR(applied_date, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM applications
      WHERE user_id = $1
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6`,
      [user.id]
    );

    return NextResponse.json({
      total_applications: parseInt(totalResult.rows[0].total),
      by_status: byStatus,
      recent_applications: recentResult.rows,
      upcoming_interviews: upcomingInterviewsResult.rows,
      applications_by_month: applicationsByMonthResult.rows,
    });
  } catch (error) {
    console.error("Get dashboard stats error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
