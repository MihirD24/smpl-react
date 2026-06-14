import { API_ENDPOINTS } from '../constant/apiEndpoint';
import { apiPost } from './api/apiService';

export const getHolidayList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.HOLIDAY_LIST);

    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching Holidays:', error.message);
    return {
      success: false,
      message: 'An error occurred while fetching Holiday.',
    };
  }
};
