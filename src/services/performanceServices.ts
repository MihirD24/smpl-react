import { apiPost } from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';

export const getPerformanceReport = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.STAFF_PERFORMANCE_REPORT);
    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching performance report:', error.message);
    return {
      success: false,
      message: 'An error occurred while fetching performance report.',
    };
  }
};
export const getTodayStaffPerformance = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.TODAY_STAFF_PERFORMANCE);

    if (response.success) {
      return response.data ?? [];
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching staff perforamce :', error.message);
    return {
      success: false,
      message: 'An error occurred while fetching  staff performance.',
    };
  }
};

export const getProjectPerformance = async (days: number) => {
  try {
    const response = await apiPost(API_ENDPOINTS.PROJECT_PERFORMANCE, { days });
    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching project performance:', error.message);
    return {
      success: false,
      message: 'An error occurred while fetching project performance.',
    };
  }
};
