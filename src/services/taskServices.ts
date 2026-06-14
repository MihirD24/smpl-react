import { apiPost } from './api/apiService';
import moment from 'moment'; // If you need it for date formatting
import { API_ENDPOINTS } from '../constant/apiEndpoint';

export const createTask = async (formData: FormData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.WORK_LOG_ADD, formData);

    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
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

// Generalized function to fetch tasks/work logs based on the type
export const getTaskByStatus = async (
  type?: string,
  params: {
    status?: any;
    search?: any;
    taskCount?: any;
    date?: any;
    module_id?: string | number;
  },
) => {
  try {
    let formData = new FormData();
    formData.append('type', type);

    if (type === 'byStatus') {
      if (
        params.status !== undefined &&
        params.status !== null &&
        params.status !== ''
      ) {
        formData.append('status', params.status);
      }
      formData.append('start', String(params.taskCount ?? 0));
      formData.append('search_value', params.search ?? '');
    } else if (type === 'byDate') {
      const fullDate = moment(params.date).format('YYYY-MM-DD');
      formData.append('work_date', fullDate);
    } else {
      formData.append('module_id', (params.module_id ?? '').toString());
    }

    // Make the API call
    const response = await apiPost(API_ENDPOINTS.WORK_LOG_LIST, formData);

    // Handle the response
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, data: [] };
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching tasks:', error.message);
    return { success: false, data: [] };
  }
};

// Function to update the task's status (e.g., "Completed By Developer")
export const updateTaskStatus = async (
  taskId: number,
  developerFeedback: string,
  taskStatus: any,
) => {
  try {
    let formData = new FormData();
    formData.append('work_log_id', taskId);
    formData.append('devloper_feedback', developerFeedback);
    formData.append('status', taskStatus);

    const response = await apiPost(
      API_ENDPOINTS.WORK_LOG_STATUS_UPDATE,
      formData,
    );

    return response;
  } catch (error) {
    if (error instanceof Error)
      console.error('Error updating task status:', error.message);
    return null;
  }
};

// Function to fetch a single task details
export const getSingleTaskDetail = async (taskId: string) => {
  try {
    let formData = new FormData();
    formData.append('id', taskId);

    const response = await apiPost(
      API_ENDPOINTS.WORK_LOG_SINGLE_DETAIL,
      formData,
    );

    return response.success ? response.data : null;
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching task details:', error.message);
    return null;
  }
};

// Function to start or stop work on a task
export const updateStartStopWork = async (
  taskId: any,
  developerFeedback: string,
  taskStatus: any,
) => {
  try {
    let formData = new FormData();
    formData.append('work_log_id', taskId);
    formData.append('devloper_feedback', developerFeedback);
    formData.append('type', taskStatus);
    const response = await apiPost(API_ENDPOINTS.WORK_LOG_START_STOP, formData);

    return response;
  } catch (error) {
    if (error instanceof Error)
      console.error('Error updating task status:', error.message);
    return null;
  }
};

export const getCurrentTask = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.ACTIVE_TASK_DETAIL);

    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.message };
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

export const getTaskCount = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.WORK_LOG_COUNT_BY_STATUS);

    if (response.success) {
      return response.data;
    } else {
      return { success: false, message: response.message };
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

export const stopAllTask = async (developerFeedback: string) => {
  try {
    let formData = new FormData();
    formData.append('devloper_feedback', developerFeedback);
    const response = await apiPost(API_ENDPOINTS.STOP_ALL_STAFF_WORK, formData);

    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
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
