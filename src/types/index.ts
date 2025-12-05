export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: Date;
}

export interface Application {
  id: number;
  user_id: number;
  company_name: string;
  position_title: number;
  job_description: number;
  location?: number;
  salary_range?: number;
  job_url?: number;
  status: ApplicationStatus;
  priority: Priority;
  applied_date: Date;
  follow_up_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type ApplicationStatus =
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type Priority = "low" | "medium" | "high";

export interface StatusHistory {
  id: number;
  application_id: number;
  status: ApplicationStatus;
  notes?: string;
  changed_at: Date;
}

export interface Contact {
  id: number;
  application_id: number;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  notes?: string;
  created_at: Date;
}

export interface Document {
  id: number;
  application_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  s3_key: string;
  uploaded_at: Date;
}

export interface Interview {
  id: number;
  application_id: number;
  interview_type: string;
  scheduled_at: Date;
  duration_minutes?: number;
  Location?: string;
  interviewer_names?: string;
  notes?: string;
  completed: boolean;
  created_at: Date;
}

export interface DashboardStats {
  total_applications: number;
  by_status: Record<ApplicationStatus, number>;
  recent_applications: Application[];
  upcoming_interviews: Interview[];
}
