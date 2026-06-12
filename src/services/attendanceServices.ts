import moment from 'moment';
import { apiPost } from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';
import { AttendanceItem, AttendanceCount } from '../types/adminAttendance';

interface AttendanceResponse {
  success: boolean;
  data?: AttendanceItem[];
  message?: string;
}

interface CountResponse {
  success: boolean;
  data?: AttendanceCount;
  message?: string;
}

export const getAttendance = async (
  selectedMonth: string | null | Date | moment.Moment,
  selectedYear: string | null | undefined,
  type?: string,
  date?: Date | string | moment.Moment | null,
): Promise<AttendanceItem[]> => {
  try {
    const formData = new FormData();

    if (type === 'admin' && date) {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      formData.append('current_date', formattedDate);
    } else {
      // Directly use the passed month and year strings without additional parsing
      const month = selectedMonth || moment().format('MM');
      const year = selectedYear || moment().format('YYYY');

      formData.append('month', month);
      formData.append('year', year);
    }

    const response: AttendanceResponse = await apiPost(
      API_ENDPOINTS.ATTENDANCE_BY_USER,
      formData,
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      console.error('Failed to fetch attendance:', response.message);
      return [];
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching attendance:', error.message);
    } else {
      console.error('Error fetching attendance:', error);
    }
    return [];
  }
};

export const getCount = async (
  selectedMonth: string | null,
  selectedYear: string | null | undefined,
  type?: string,
  date?: Date | string | moment.Moment | null,
): Promise<AttendanceCount> => {
  const defaultCount: AttendanceCount = {
    total_present: 0,
    total_absent: 0,
    total_halfday: 0,
    total_paidleave: 0,
    total_late_time_in_min: 0,
    total_extra_time_in_min: 0,
  };

  try {
    const formData = new FormData();

    if (type === 'admin' && date) {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      formData.append('current_date', formattedDate);
    } else {
      // Directly use the passed month and year strings without additional parsing
      const month = selectedMonth || moment().format('MM');
      const year = selectedYear || moment().format('YYYY');

      formData.append('month', month);
      formData.append('year', year);
    }

    const response: CountResponse = await apiPost(
      API_ENDPOINTS.ATTENDANCE_STATUS_COUNT,
      formData,
    );

    if (response.success && response.data) {
      return response.data;
    } else {
      console.error('Failed to fetch count:', response.message);
      return defaultCount;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching attendance count:', error.message);
    } else {
      console.error('Error fetching attendance count:', error);
    }
    return defaultCount;
  }
};
