export interface Project {
  id: number;
  party_id: number;
  project_name: string;
  duration: string;
  amount: string;
  advance: string | null;
  remarks: string | null;
  contact_detail: string | null;
  commission: string | null;
  technology: string | null;
  reference_by: string;
  status: string;
  start_date: string;
  end_date: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffProject {
  id: number;
  emp_id: number;
  project_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  stff_belongs_to_project: Project;
}

export interface ProjectListResponse {
  success: boolean;
  data: StaffProject[];
  message: string;
}
