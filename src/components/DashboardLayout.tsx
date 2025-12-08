"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Container } from "react-bootstrap";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <Container fluid>
          <Link href="/dashboard" className="navbar-brand">
            JobTrack
          </Link>
          <Button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </Button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/dashboard/applications" className="nav-link">
                  Applications
                </Link>
              </li>
            </ul>
            <div className="d-flex align-items-center text-white">
              <span className="me-3">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <Button onClick={handleLogout} variant="outline-light">
                Logout
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      <main className="container-fluid py-4">{children}</main>
    </div>
  );
}
