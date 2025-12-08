"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { format } from "date-fns";
import { Button, Col, Container } from "react-bootstrap";

export default function ApplicationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("applied_date");
  const [sortOrder, setSortOrder] = useState("DESC");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("sortBy,", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await fetch(`/api/applications?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setApplications(applications.filter((app) => app.id !== id));
        alert("Application deleted successfully");
      } else {
        alert("Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application: ", error);
      alert("Error deleting application");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const getPriorityBadgeClass = (priority: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classes: any = {
      high: "bg-danger",
      medium: "bg-warning",
      low: "bg-secondary",
    };
    return classes[priority] || "bg-secondary";
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
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

  return (
    <DashboardLayout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2">Job Applications</h1>
          <Button href="/dashboard/applications/new" variant="primary">
            + Add Application
          </Button>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <Col md={4}>
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Company or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="phone_screen">Phone Screen</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </Col>
              <Col md={2}>
                <label className="form-label">Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="applied_date">Applied Date</option>
                  <option value="company_name">Company</option>
                  <option value="position_title">Position</option>
                  <option value="status">Status</option>
                </select>
              </Col>
              <Col md={2}>
                <label className="form-label">Order</label>
                <select
                  className="form-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="DESC">Newest First</option>
                  <option value="ASC">Oldest First</option>
                </select>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="w-100">
                  Search
                </Button>
              </Col>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            {applications.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No applications found.</p>
                <Button href="/dashboard/applications/new" variant="primary">
                  Add Your First Application
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Position</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Applied Date</th>
                      <th>Interviews</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="text-decoration-none fw-bold"
                          >
                            {app.company_name}
                          </Link>
                        </td>
                        <td>{app.position_title}</td>
                        <td>{app.location || "-"}</td>
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
                          <span
                            className={`badge ${getPriorityBadgeClass(
                              app.priority
                            )}`}
                          >
                            {app.priority}
                          </span>
                        </td>
                        <td>
                          {format(new Date(app.applied_date), "MMM dd, yyyy")}
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {app.interview_count || 0}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button
                              href={`/dashboard/applications/${app.id}`}
                              variant="outline-primary"
                            >
                              View
                            </Button>
                            <Button
                              href={`/dashboard/applications/${app.id}/edit`}
                              variant="outline-secondary"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(app.id)}
                              variant="outline-danger"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Container>
    </DashboardLayout>
  );
}
