import {apiPost} from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';

export const getNotificationData = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.GET_NOTIFICATION_LIST);

    if (response.success) {
      return response.data;
    } else {
      return {success: false, message: response.message};
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching notification data:', error.message);
    return {
      success: false,
      message: 'An error occurred while fetching notification data.',
    };
  }
};
