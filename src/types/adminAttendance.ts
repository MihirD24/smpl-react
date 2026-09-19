// types/adminAttendance.ts

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Paid Leave';

export interface PunchSession {
  id?: number;
  punch_in: string;
  punch_out?: string | null;
  duration_minutes?: number;
  duration_formatted?: string;
  punch_type?: string;
  is_active?: boolean;
}

export interface GraceInfo {
  late_grace_allowed: number;
  late_used_minutes: number;
  late_remaining_minutes: number;
  late_excess_minutes: number;
  early_grace_allowed: number;
  early_used_minutes: number;
  early_remaining_minutes: number;
  early_excess_minutes: number;
}

export interface CheckAttendanceData {
  show_label: 'Punch_in' | 'Punch_out' | string;
  in_time?: string | null;
  out_time?: string | null;
  today_attendance_status?: string;
  raw_status?: string;
  total_work_minutes?: number;
  total_work_formatted?: string;
  total_break_minutes?: number;
  total_break_formatted?: string;
  out_location?: string;
  punches?: PunchSession[];
  grace_info?: GraceInfo;
}

// In types/adminAttendance.ts
export interface AttendanceItem {
  id: number;
  emp_id?: number;
  date: string;           // "YYYY-MM-DD"
  in_time: string | null;
  out_time: string | null;
  late_entry?: number;
  early_exit?: number;
  extra_time?: number;
  total_minutes?: number;
  total_work_minutes?: number;
  total_work_formatted?: string;
  total_break_minutes?: number;
  total_break_formatted?: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Paid Leave' | 'Half Day';
  remarks?: string | null;
  in_location?: string | null;
  out_location?: string | null;
  in_image?: string | null;
  out_image?: string | null;
  in_lat?: number | string | null;
  in_long?: number | string | null;
  out_lat?: number | string | null;
  out_long?: number | string | null;
  leave_id?: number | null;
  leave?: {               // was leave_detail
    id: number;
    reason: string;
    type: string;
    status: number;
    from_date: string;
    to_date: string;
  } | null;
  punches?: PunchSession[];
}

export interface AttendanceCount {
  total_present: number;
  total_absent: number;
  total_halfday: number;
  total_paidleave: number;
  total_notmarked?: number;
  total_late_time_in_min: number;
  total_extra_time_in_min: number;
  total_early_exit_in_min?: number;
  late_grace_allowed?: number;
  late_grace_remaining?: number;
  late_grace_excess?: number;
  early_grace_allowed?: number;
  early_grace_remaining?: number;
  early_grace_excess?: number;
}

export type UserRole = 'admin' | 'user' | 'team_lead';
