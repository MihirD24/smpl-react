// types/adminAttendance.ts

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Paid Leave';

// In types/adminAttendance.ts
export interface AttendanceItem {
  id: number;
  emp_id: number;
  date: string;           // "YYYY-MM-DD"
  in_time: string | null;
  out_time: string | null;
  late_entry: number;
  early_exit: number;
  extra_time: number;
  total_minutes: number ;
  status: 'Present' | 'Absent' | 'Leave' | 'Paid Leave' | 'Half Day';
  remarks: string | null;
  in_location: string | null;
  out_location: string | null;
  in_image?: string | null;
  out_image?: string | null;
  in_lat?: number | string | null;
  in_long?: number | string | null;
  out_lat?: number | string | null;
  out_long?: number | string | null;
  leave_id: number | null;
  leave: {               // was leave_detail
    id: number;
    reason: string;
    type: string;
    status: number;
    from_date: string;
    to_date: string;
  } | null;
  // remove: leave_detail, attendance_remarks — these don't exist in API
}

export interface AttendanceCount {
  total_present: number;
  total_absent: number;
  total_halfday: number;
  total_paidleave: number;
  total_late_time_in_min: number;
  total_extra_time_in_min: number;
}

export type UserRole = 'admin' | 'user' | 'team_lead';
