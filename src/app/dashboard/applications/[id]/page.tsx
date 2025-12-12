/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { format } from "date-fns";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    notes: "",
  });

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interviewType: "",
    scheduledAt: "",
    durationMinutes: "",
    location: "",
    interviewerNames: "",
    notes: "",
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${resolvedParams.id}`);
        if (response.ok) {
          const appData = await response.json();
          setData(appData);
        }
      } catch (error) {
        console.error("Error fetching application: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [resolvedParams.id]);

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
    return status.replace("_", "").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/applications/${resolvedParams.id}/contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactForm),
        }
      );

      if (response.ok) {
        setShowContactModal(false);
        setContactForm({
          name: "",
          role: "",
          email: "",
          phone: "",
          linkedinUrl: "",
          notes: "",
        });
        fetchApplication();
      }
    } catch (error) {
      console.error("Error adding contact: ", error);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApplication();
      }
    } catch (error) {
      console.error("Error deleting contact: ", error);
    }
  };

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/applications/${resolvedParams.id}/interviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...interviewForm,
            durationMinutes: interviewForm.durationMinutes
              ? parseInt(interviewForm.durationMinutes)
              : null,
          }),
        }
      );

      if (response.ok) {
        setShowInterviewModal(false);
        setInterviewForm({
          interviewType: "",
          scheduledAt: "",
          durationMinutes: "",
          location: "",
          interviewerNames: "",
          notes: "",
        });
        fetchApplication();
      }
    } catch (error) {
      console.error("Error adding interview: ", error);
    }
  };

  const handleDeleteInterview = async (interviewId: number) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApplication();
      }
    } catch (error) {
      console.error("Error deleting interview: ", error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <Alert variant="danger">Application not found</Alert>
      </DashboardLayout>
    );
  }

  const app = data.application;

  return (
    <DashboardLayout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link
              href="/dashboard/applications"
              className="text-decoration-none text-muted mb-2 d-block"
            >
              <i className="bi bi-arrow-left"></i> Back to Applications
            </Link>
            <h1 className="h2 mb-1">{app.company_name}</h1>
            <p className="text-muted mb-0">{app.position_title}</p>
          </div>
          <div>
            <Button
              href={`/dashboard/applications/${app.id}/edit`}
              variant="outline-primary"
              className="me-2"
            >
              <i className="bi bi-pencil-fill"></i> Edit Application
            </Button>
          </div>
        </div>

        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card>
              <Card.Body>
                <small className="text-muted">Status</small>
                <div className="mt-2">
                  <span
                    className={`badge ${getStatusBadgeClass(app.status)} fs-6`}
                  >
                    {formatStatus(app.status)}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card>
              <Card.Body>
                <small className="text-muted">Applied Date</small>
                <p className="mb-0 mt-2 fw-bold">
                  {format(new Date(app.applied_date), "MMM dd, yyyy")}
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card>
              <Card.Body>
                <small className="text-muted">Location</small>
                <p className="mb-0 mt-2">{app.location || "Not specified"}</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card>
              <Card.Body>
                <small className="text-muted">Salary Range</small>
                <p className="mb-0 mt-2">
                  {app.salary_range || "Not specified"}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <Button
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
          </li>
          <li className="nav-item">
            <Button
              className={`nav-link ${activeTab === "contacts" ? "active" : ""}`}
              onClick={() => setActiveTab("contacts")}
            >
              Contacts ({data.contacts.length})
            </Button>
          </li>
          <li className="nav-item">
            <Button
              className={`nav-link ${
                activeTab === "interviews" ? "active" : ""
              }`}
              onClick={() => setActiveTab("interviews")}
            >
              Interviews {data.interviews.length}
            </Button>
          </li>
          <li className="nav-item">
            <Button
              className={`nav-link ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              Status History
            </Button>
          </li>
        </ul>

        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <Row>
              <Col md={8}>
                <Card className="mb-3">
                  <Card.Header>
                    <h5 className="mb-0">Job Details</h5>
                  </Card.Header>
                  <Card.Body>
                    {app.job_url && (
                      <div className="mb-3">
                        <strong>Job Posting:</strong>
                        <br />
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {app.job_url}
                        </a>
                      </div>
                    )}

                    {app.job_description && (
                      <div className="mb-3">
                        <strong>Description:</strong>
                        <p className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                          {app.job_description}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {app.notes && (
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Notes</h5>
                    </Card.Header>
                    <Card.Body>
                      <p style={{ whiteSpace: "pre-wrap" }}>{app.notes}</p>
                    </Card.Body>
                  </Card>
                )}
              </Col>

              <Col md={4}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Additional Info</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Priority:</strong>
                      <span className="ms-2 badge bg-secondary">
                        {app.priority}
                      </span>
                    </div>

                    {app.follow_up_date && (
                      <div className="mb-3">
                        <strong>Follow-up Date:</strong>
                        <p className="mb-0 mt-1">
                          {format(new Date(app.follow_up_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    )}

                    <div className="mb-3">
                      <strong>Created:</strong>
                      <p className="mb-0 mt-1">
                        {format(new Date(app.created_at), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>

                    <div>
                      <strong>Last Updated:</strong>
                      <p className="mb-0 mt-1">
                        {format(new Date(app.updated_at), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Contacts</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowContactModal(true)}
                >
                  <i className="bi bi-plus-square-fill"></i> Add Contact
                </Button>
              </Card.Header>
              <Card.Body>
                {data.contacts.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No contacts added yet
                  </p>
                ) : (
                  <Row>
                    {data.contacts.map((contact: any) => (
                      <Col key={contact.id} md={6} className="mb-3">
                        <Card>
                          <Card.Body>
                            <div className="d-flex justify-content-between">
                              <h6>{contact.name}</h6>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteContact(contact.id)}
                              >
                                <i className="bi bi-trash-fill"></i> Delete
                              </Button>
                            </div>
                            {contact.role && (
                              <p className="text-muted small mb-2">
                                {contact.role}
                              </p>
                            )}
                            {contact.email && (
                              <p className="mb-1">
                                <strong>Email:</strong> {contact.email}
                              </p>
                            )}
                            {contact.phone && (
                              <p className="mb-1">
                                <strong>Phone:</strong> {contact.phone}
                              </p>
                            )}
                            {contact.linkedin_url && (
                              <p className="mb-1">
                                <strong>LinkedIn:</strong>{" "}
                                <a
                                  href={contact.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Profile
                                </a>
                              </p>
                            )}
                            {contact.notes && (
                              <p className="mb-0 mt-2">
                                <small>{contact.notes}</small>
                              </p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Interviews Tab */}
          {activeTab === "interviews" && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Interviews</h5>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowInterviewModal(true)}
                >
                  <i className="bi bi-plus-square-fill"></i> Add Interview
                </Button>
              </Card.Header>
              <Card.Body>
                {data.interviews.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No interviews scheduled yet
                  </p>
                ) : (
                  <div className="list-group">
                    {data.interviews.map((interview: any) => (
                      <div key={interview.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{interview.interview_type}</h6>
                            <p className="mb-1">
                              <strong>Date:</strong>{" "}
                              {format(
                                new Date(interview.scheduled_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </p>
                            {interview.duration_minutes && (
                              <p className="mb-1">
                                <strong>Duration:</strong>{" "}
                                {interview.duration_minutes} minutes
                              </p>
                            )}
                            {interview.location && (
                              <p className="mb-1">
                                <strong>Location:</strong> {interview.location}
                              </p>
                            )}
                            {interview.interviewer_names && (
                              <p className="mb-1">
                                <strong>Interviewers:</strong>{" "}
                                {interview.interviewer_names}
                              </p>
                            )}
                            {interview.notes && (
                              <p className="mb-0 mt-2">
                                <small>{interview.notes}</small>
                              </p>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteInterview(interview.id)}
                          >
                            <i className="bi bi-trash-fill"></i> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Status History Tab */}
          {activeTab === "history" && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Status History</h5>
              </Card.Header>
              <Card.Body>
                <div className="timeline">
                  {data.statusHistory.map((history: any, index: number) => (
                    <div key={history.id} className="mb-3">
                      <div className="d-flex">
                        <div className="me-3">
                          <span
                            className={`badge ${getStatusBadgeClass(
                              history.status
                            )}`}
                          >
                            {formatStatus(history.status)}
                          </span>
                        </div>
                        <div>
                          <p className="mb-0">{history.notes}</p>
                          <small className="text-muted">
                            {format(
                              new Date(history.changed_at),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </small>
                        </div>
                      </div>
                      {index < data.statusHistory.length - 1 && (
                        <hr className="my-3" />
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <Modal
            show
            onHide={() => setShowContactModal(false)}
            centered
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Contact</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleAddContact}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    value={contactForm.role}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, role: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>LinkedIn URL</Form.Label>
                  <Form.Control
                    type="url"
                    value={contactForm.linkedinUrl}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        linkedinUrl: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={contactForm.notes}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, notes: e.target.value })
                    }
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowContactModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Contact
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}

        {/* Interview Modal */}
        {showInterviewModal && (
          <Modal
            show={showInterviewModal}
            onHide={() => setShowInterviewModal(false)}
            centered
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Interview</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleAddInterview}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Interview Type *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Phone Screen, Technical Interview"
                    value={interviewForm.interviewType}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        interviewType: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Scheduled Data & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={interviewForm.scheduledAt}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        scheduledAt: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    value={interviewForm.durationMinutes}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        durationMinutes: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Zoom, Office, Phone"
                    value={interviewForm.location}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        location: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Interviewer Names</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., John Doe, Jane Smith"
                    value={interviewForm.interviewerNames}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        interviewerNames: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={interviewForm.notes}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowInterviewModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Interview
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        )}
      </Container>
    </DashboardLayout>
  );
}
