// Types for Leave Request functionality

export interface StaffDetail {
  id: number;
  name: string;
  username: string;
  email: string;
  email_verified_at: string | null;
  role: number;
  fcm_token: string | null;
  api_token: string | null;
  mobile_no: string;
  emergency_contact_no: string | null;
  mobile_verification_otp: string | null;
  is_mobile_verified: number;
  status: number;
  profile_pic: string | null;
  department_id: number | null;
  designation_id: number | null;
  site_id: number | null;
  timing_id: number | null;
  doj: string | null;
  dob: string | null;
  salary: number | null;
  allowed_paid_leave: number;
  remaining_paid_leave: number;
  staff_time_diff: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveData {
  id: number;
  emp_id: number;
  start_date: string;
  end_date: string | null;
  reason: string | null;
  status: number;
  employee: {
    name: string;
  };
  type: string;
  from_date: string;
  to_date: string;
  leave_status: number; // 0: Pending, 1: Approved, 2: Rejected
  leave_type: string;
  created_at: string;
  updated_at: string;
  get_staff_detail: StaffDetail;
}

export interface LeaveResponse {
  success: boolean;
  data: LeaveData[];
  message: string;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
}

export interface FormattedDate {
  month: string;
  day: string;
}
