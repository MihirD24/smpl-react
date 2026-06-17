import { API_ENDPOINTS } from '../constant/apiEndpoint';
import ToastUtil from '../utils/toastAndroid';
import { apiPost } from './api/apiService';

export const getStaffAttendanceData = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.ATTENDANCE_DATA, {});

    if (response.success) {
      return response.data;
    } else {
      ToastUtil.error(
        response.message || 'Failed to fetch staff attendance data',
      );
      return [];
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch staff attendance');
      ToastUtil.error(error.message || 'An error occurred while fetching data');
    }
  }
};

export const getDashboardSalesData = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.DASHBOARD_SALES, {});

    if (response.success) {
      return response.data;
    } else {
      ToastUtil.error(
        response.message || 'Failed to fetch dashboard sales data',
      );
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch dashboard sales data');
      ToastUtil.error(error.message || 'An error occurred while fetching data');
    }
  }
};

export const getDashboardPurchaseData = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.DASHBOARD_PURCHASE, {});

    if (response.success) {
      return response.data;
    } else {
      ToastUtil.error(
        response.message || 'Failed to fetch dashboard purchase data',
      );
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch dashboard purchase data');
      ToastUtil.error(error.message || 'An error occurred while fetching data');
    }
  }
};

export const getDashboardCount = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.GET_DASHBOARD_COUNT, {});

    if (response.success) {
      return response.data;
    } else {
      ToastUtil.error(
        response.message || 'Failed to fetch dashboard count data',
      );
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch dashboard count data');
      ToastUtil.error(error.message || 'An error occurred while fetching data');
    }
  }
};
