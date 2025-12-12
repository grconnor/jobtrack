"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { use } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";

export default function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    positionTitle: "",
    jobDescription: "",
    location: "",
    salaryRange: "",
    jobUrl: "",
    status: "applied",
    priority: "medium",
    appliedDate: "",
    followUpDate: "",
    notes: "",
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          const app = data.application;

          setFormData({
            companyName: app.company_name,
            positionTitle: app.position_title,
            jobDescription: app.job_description || "",
            location: app.location || "",
            salaryRange: app.salary_range || "",
            jobUrl: app.job_url || "",
            status: app.status,
            priority: app.priority,
            appliedDate: app.applied_date.split("T")[0],
            followUpDate: app.follow_up_date
              ? app.follow_up_date.split("T")[0]
              : "",
            notes: app.notes || "",
          });
        } else {
          setError("Application not found");
        }
      } catch (err) {
        setError("Error loading application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [resolvedParams.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/applications/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/applications/${resolvedParams.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update application");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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

  return (
    <DashboardLayout>
      <Container fluid>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2">Edit Application</h1>
              <Button
                href={`/dashboard/applications/${resolvedParams.id}`}
                variant="outline-secondary"
              >
                Cancel
              </Button>
            </div>

            {error && (
              <Alert variant="danger" role="alert">
                {error}
              </Alert>
            )}

            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <h5 className="mb-3">Basic Information</h5>
                  <Row className="mb-3">
                    <Col md={6}>
                      <label htmlFor="companyName" className="form-label">
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <label htmlFor="positionTitle" className="form-label">
                        Position Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="positionTitle"
                        name="positionTitle"
                        value={formData.positionTitle}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <label htmlFor="location" className="form-label">
                        Location
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </Col>
                    <Col md={6}>
                      <label htmlFor="salaryRange" className="form-label">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="salaryRange"
                        name="salaryRange"
                        value={formData.salaryRange}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>

                  <div className="mb-3">
                    <label htmlFor="jobUrl" className="form-label">
                      Job URL
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="jobUrl"
                      name="jobUrl"
                      value={formData.jobUrl}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="jobDescription" className="form-label">
                      Job Description
                    </label>
                    <textarea
                      className="form-control"
                      id="jobDescription"
                      name="jobDescription"
                      rows={4}
                      value={formData.jobDescription}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <hr className="my-4" />

                  <h5 className="mb-3">Status & Priority</h5>
                  <Row className="mb-3">
                    <Col md={4}>
                      <label htmlFor="status" className="form-label">
                        Status
                      </label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="applied">Applied</option>
                        <option value="phone_screen">Phone Screen</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </Col>
                    <Col md={4}>
                      <label htmlFor="priority" className="form-label">
                        Priority
                      </label>
                      <select
                        className="form-select"
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </Col>
                    <Col md={4}>
                      <label htmlFor="appliedDate" className="form-label">
                        Applied Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="appliedDate"
                        name="appliedDate"
                        value={formData.appliedDate}
                        onChange={handleChange}
                        required
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <label htmlFor="followUpDate" className="form-label">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="followUpDate"
                        name="followUpDate"
                        value={formData.followUpDate}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h5 className="mb-3">Notes</h5>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      href={`/dashboard/applications/${resolvedParams.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}
