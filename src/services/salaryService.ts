import { API_ENDPOINTS } from '../constant/apiEndpoint';
import { apiPost } from './api/apiService';

// ─── Developer (Staff) Types ──────────────────────────────────────────────────

export interface Developer {
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
  salary: string | null;
  allowed_paid_leave: number;
  remaining_paid_leave: number;
  staff_time_diff: number;
  created_at: string;
  updated_at: string;
}

export interface DevelopersListResponse {
  success: boolean;
  data: Developer[];
  message: string;
}

// ─── Salary Types ─────────────────────────────────────────────────────────────

export interface SalaryRecord {
  id: number;
  emp_id: string;
  head_type_id: number | null;
  salary: string | null;
  entry_date: string;
  start_date: string;
  end_date: string;
  working_days: string;
  leave_days: string;
  holiday: number;
  total_amount: string;
  paid_amount: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  /** Populated only on admin responses */
  get_staff?: Developer;
}

export interface SalaryListResponse {
  success: boolean;
  data: SalaryRecord[];
  message: string;
}

export interface SalaryListParams {
  month?: number;
  year?: number;
  emp_id?: number | null;
}

export const getDevelopersList = async (): Promise<{
  success: boolean;
  data: Developer[];
}> => {
  try {
    const response: DevelopersListResponse = await apiPost(
      API_ENDPOINTS.DEVELOPERS_LIST,
    );

    if (response.success) {
      return { success: true, data: response.data };
    }

    return { success: false, data: [] };
  } catch (error) {
    console.error('[getDevelopersList] Error:', error);
    return { success: false, data: [] };
  }
};

export const getStaffSalaryList = async (
  params: SalaryListParams,
): Promise<{
  success: boolean;
  data: SalaryRecord[];
}> => {
  try {
    const formData = new FormData();

    formData.append('month', params?.month?.toString() || '');
    formData.append('year', params?.year?.toString() || '');
    formData.append('employee_id', params?.emp_id?.toString() || '');

    const response: SalaryListResponse = await apiPost(
      API_ENDPOINTS.SALARY_LIST,
      formData,
    );

    if (response.success) {
      return { success: true, data: response.data };
    }

    return { success: false, data: [] };
  } catch (error) {
    console.error('[getSalaryList] Error:', error);
    return { success: false, data: [] };
  }
};

export const getSalaryList = async (): Promise<{
  success: boolean;
  data: SalaryRecord[];
}> => {
  try {
    const response = await apiPost(API_ENDPOINTS.SALARY_LIST);

    if (response.success) {
      return { success: true, data: response.data };
    }

    return { success: false, data: [] };
  } catch (error) {
    console.error('[getSalaryList] Error:', error);
    return { success: false, data: [] };
  }
};

export const getSalaryPdf = async (formData: FormData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.PRINT_SALARY_SLIP, formData);
    if (response.status) {
      // Assuming the API returns a URL to the generated PDF
      return response ?? [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('[downloadSalarySlip] Error:', error);
    return { success: false, url: '' };
  }
};
