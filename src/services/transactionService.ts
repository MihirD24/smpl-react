import {apiPost} from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';



export const getPartyList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.PARTY_LIST);

    if (response.success) {
      return response.data;
    } else {
      return {success: false, message: response.message};
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching party list:', error.message);
    return {
      success: false,
      message: 'An error occurred while fetching party list.',
    };
  }
};


