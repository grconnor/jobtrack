"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Col, Container, Row } from "react-bootstrap";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={8} className="text-center">
          <h1 className="display-4 mb-4">Welcome to JobTrack</h1>
          <p className="lead mb-5">
            Track you job applications, manage interviews, and land your dream
            job.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button href="/register" variant="primary" size="lg">
              Get Started
            </Button>
            <Button href="/login" variant="outline-primary" size="lg">
              Login
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
