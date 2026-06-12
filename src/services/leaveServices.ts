import {apiPost, apiPostUpload} from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';

export const getLeaveRequest = async (loginuserId: string) => {
  try {
    let formData = new FormData();
    formData.append('user_id', loginuserId);

    const response = await apiPostUpload(API_ENDPOINTS.LEAVE_BY_USER, formData);

    if (response.success) {
      return response.data;
    } else {
      return {success: false, message: response.message};
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error creating task:', error.message);
    return {
      success: false,
      message: 'An error occurred while creating the task.',
    };
  }
};

export const addLeave = async (formData: FormData) => {
  try {
    const response = await apiPostUpload(API_ENDPOINTS.ADD_LEAVE, formData);

    if (response.success) {
      return {success: true, message: response.message};
    } else {
      return {success: false, message: response.message};
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error creating task:', error.message);
    return {
      success: false,
      message: 'An error occurred while creating the task.',
    };
  }
};

export const handleApproval = async (formData: FormData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.LEAVE_ACCEPT_REJECT, formData);

    if (response.success) {
      return {success: true, message: response.message};
    } else {
      return {success: false, message: response.message};
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error creating task:', error.message);
    return {
      success: false,
      message: 'An error occurred while creating the task.',
    };
  }
};
