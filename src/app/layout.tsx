import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobTrack - Application Tracker",
  description: "Track your job applications efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
