// types/taskData.ts
export interface TaskData {
  work_log_id: string;
  description: string;
  priority: string;
  work_type: string;
  status: string;
  estimated_minutes: number | string;  // ✅ add this
  project_name: string;
  project_work_module_name: string;
  staff_name: string;
  total_minutes: number | string;
  id?: string;
}