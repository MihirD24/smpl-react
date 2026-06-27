import {apiPost} from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';

export const userDetails = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.USER_DETAILS);

    if (response.success) {
      return response.data;
    } else {
      return {success: false, message: response.message};
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching user details:', error.message);
    return {
      success: false,
      message: 'An error occurred while fetching user details.',
    };
  }
};
