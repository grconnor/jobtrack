/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { format } from "date-fns";
import { Col, Container, Row } from "react-bootstrap";

interface DashboardStats {
  total_applications: number;
  by_status: {
    applied: number;
    phone_screen: number;
    interview: number;
    offer: number;
    rejected: number;
    withdrawn: number;
  };
  recent_applications: any[];
  upcoming_interviews: any[];
  applications_by_month: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    const classes: any = {
      applied: "bg-primary",
      phone_screen: "bg-info",
      interview: "bg-warning",
      offer: "bg-success",
      rejected: "bg-danger",
      withdrawn: "bg-secondary",
    };
    return classes[status] || "bg-secondary";
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <DashboardLayout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2">Dashboard</h1>
          <Link href="/dashboard/applications/new" className="btn btn-primary">
            + Add Application
          </Link>
        </div>

        <Row className="g-3 mb-4">
          <Col md={3}>
            <div className="card text-white bg-primary">
              <div className="card-body">
                <h5 className="card-title">Total Applications</h5>
                <h2 className="mb-0">{stats?.total_applications || 0}</h2>
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div className="card text-white bg-info">
              <div className="card-body">
                <h5 className="card-title">Phone Screens</h5>
                <h2 className="mb-0">{stats?.by_status.phone_screen || 0}</h2>
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div className="card text-white bg-warning">
              <div className="card-body">
                <h5 className="card-title">Interviews</h5>
                <h2 className="mb-0">{stats?.by_status.interview || 0}</h2>
              </div>
            </div>
          </Col>

          <Col md={3}>
            <div className="card text-white bg-success">
              <div className="card-body">
                <h5 className="card-title">Offers</h5>
                <h2 className="mb-0">{stats?.by_status.offer || 0}</h2>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Applications</h5>
                <Link
                  href="/dashboard/applications"
                  className="btn btn-sm btn-outline-primary"
                >
                  View All
                </Link>
              </div>
              <div className="card-body">
                {stats?.recent_applications.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No applications yet. Start by adding your first one!
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Position</th>
                          <th>Status</th>
                          <th>Applied Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recent_applications.map((app) => (
                          <tr key={app.id}>
                            <td>
                              <Link
                                href={`/dashboard/applications/${app.id}`}
                                className="text-decoration-none"
                              >
                                {app.company_name}
                              </Link>
                            </td>
                            <td>{app.position_title}</td>
                            <td>
                              <span
                                className={`badge ${getStatusBadgeClass(
                                  app.status
                                )}`}
                              >
                                {formatStatus(app.status)}
                              </span>
                            </td>
                            <td>
                              {format(
                                new Date(app.applied_date),
                                "MMM dd, yyyy"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col md={4}>
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Upcoming Interviews</h5>
              </div>
              <div className="card-body">
                {stats?.upcoming_interviews.length === 0 ? (
                  <p className="text-muted text-center">
                    No upcoming interviews
                  </p>
                ) : (
                  <div className="list-group list-group-flush">
                    {stats?.upcoming_interviews.map((interview) => (
                      <div key={interview.id} className="list-group-item px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{interview.company_name}</h6>
                            <p className="mb-1 small text-muted">
                              {interview.position_title}
                            </p>
                            <p className="mb-0 small">
                              <strong>{interview.interview_type}</strong>
                            </p>
                          </div>
                          <small className="text-muted">
                            {format(
                              new Date(interview.scheduled_at),
                              "MMM dd, HH:mm"
                            )}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Status Overview</h5>
              </div>
              <div className="card-body">
                <Row className="text-center">
                  <Col>
                    <div className="mb-2">
                      <span className="badge bg-primary fs-5">
                        {stats?.by_status.applied || 0}
                      </span>
                    </div>
                    <small className="text-muted">Applied</small>
                  </Col>
                  <Col>
                    <div className="mb-2">
                      <span className="badge bg-info fs-5">
                        {stats?.by_status.phone_screen || 0}
                      </span>
                    </div>
                    <small className="text-muted">Phone Screen</small>
                  </Col>
                  <Col>
                    <div className="mb-2">
                      <span className="badge bg-success fs-5">
                        {stats?.by_status.offer || 0}
                      </span>
                    </div>
                    <small className="text-muted">Offers</small>
                  </Col>
                  <Col>
                    <div className="mb-2">
                      <span className="badge bg-danger fs-5">
                        {stats?.by_status.rejected || 0}
                      </span>
                    </div>
                    <small className="text-muted">Rejected</small>
                  </Col>
                  <Col>
                    <div className="mb-2">
                      <span className="badge bg-secondary fs-5">
                        {stats?.by_status.withdrawn || 0}
                      </span>
                    </div>
                    <small className="text-muted">Withdrawn</small>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}
