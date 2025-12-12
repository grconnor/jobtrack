"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    appliedDate: new Date().toISOString().split("T")[0],
    followUpDate: "",
    notes: "",
  });

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
    setLoading(true);

    if (
      !formData.companyName ||
      !formData.positionTitle ||
      !formData.appliedDate
    ) {
      setError("Company name, position title and applied date are required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/applications/${data.application.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create application");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Container fluid>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2">Add New Application</h1>
              <Button
                href="/dashboard/applications"
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
                        placeholder="Google"
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
                        placeholder="Engineer"
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
                        placeholder="e.g., New York, NY or Remote"
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
                        placeholder="e.g., R700,000 - R1,000,000"
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
                      placeholder="https://..."
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
                      placeholder="Paste the job description here..."
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
                      <small className="text-muted">
                        Set a reminder to follow up
                      </small>
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
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? "Creating..." : "Create Application"}
                    </Button>
                    <Button
                      href="/dashboard/applications"
                      type="button"
                      variant="outline-secondary"
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
