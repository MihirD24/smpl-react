import { apiPost, apiPostUpload } from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';

// ─── Punch In ─────────────────────────────────────────────────────────────────

export const punchIn = async (formData: FormData) => {
  try {
    const response = await apiPostUpload(API_ENDPOINTS.ADD_IN_TIME, formData);

    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error punching in:', error.message);
    }
    return { success: false, message: 'An error occurred while punching in.' };
  }
};

// ─── Punch Out ────────────────────────────────────────────────────────────────

export const punchOut = async (formData: FormData) => {
  try {
    const response = await apiPostUpload(API_ENDPOINTS.ADD_OUT_TIME, formData);

    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error punching out:', error.message);
    }
    return { success: false, message: 'An error occurred while punching out.' };
  }
};

// ─── Check Punch ──────────────────────────────────────────────────────────────

export const checkPunch = async (currentDate: string) => {
  try {
    const formData = new FormData();
    formData.append('date', currentDate);
    console.log('Check punch formData:', formData);

    const response = await apiPost(API_ENDPOINTS.CHECK_ATTENDANCE, formData);
    console.log('Check punch response:', response);
    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error checking punch:', error.message);
    }
    return {
      success: false,
      message: 'An error occurred while checking attendance.',
    };
  }
};
