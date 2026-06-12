import { API_ENDPOINTS } from '../constant/apiEndpoint';
import ToastUtil from '../utils/toastAndroid';
import { apiPost } from './api/apiService';
export type EmergencyActionType = 'taskStop' | 'puchOut';

export const updateTaskStopPunchOutByType = async (
  type: EmergencyActionType,
) => {
  try {
    const formData = new FormData();

    formData.append('type', type);

    const response = await apiPost(
      API_ENDPOINTS.UPDATE_TASK_STOP_PUNCH_OUT_BY_TYPE,
      formData,
    );

    if (response.success) {
      ToastUtil.success(response.message || 'Action completed successfully');

      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    } else {
      ToastUtil.error(response.message || 'Failed to perform action');

      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error) {
    console.error('Emergency action error:', error);

    if (error instanceof Error) {
      ToastUtil.error(error.message || 'Something went wrong');

      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

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

export const getRunningTask = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.GET_RUNNING_TASK, {});

    if (response.success) {
      return response.data;
    } else {
      ToastUtil.error(response.message || 'Failed to fetch running task data');
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to fetch running task data');
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
