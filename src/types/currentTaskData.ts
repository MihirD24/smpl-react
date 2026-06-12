// ===== Project Module =====
type ProjectModule = {
  id: number;
  project_id: number;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
};

// ===== Project =====
type Project = {
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
  created_at: string;
  updated_at: string;
};

// ===== Parent Work Log =====
type ParentWorkLog = {
  id: number;
  project_id: number;
  module_id: number;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  work_type: string;
  status: 'Pending' | 'Working' | 'Completed';
  estimated_minutes: number;
  title: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;

  get_selected_project: Project;
  get_selected_projectmodule: ProjectModule;
};

// ===== Current Task Data =====
export type CurrentTaskData = {
  id: number;
  work_log_id: number;
  emp_id: number;
  is_team_lead: number;
  work_date: string;
  start_time: string;
  end_time: string | null;
  devloper_feedback: string | null;
  created_at: string;
  updated_at: string;
  button_status: 'Start' | 'Stop';
  total_minutes: number;
  stopped_at: string | null;
  started_at: string | null;
  status: string;
  work_status: string;

  parent_work_log: ParentWorkLog;
};
