import { apiPost } from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';

export const getAllotedProjectList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.ALLOTED_PROJECT_LIST);

    if (response.success) {
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      return data;
    } else {
      console.warn('getAllotedProjectList failed:', response.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching project list:', error);
    return [];
  }
};

export const getModuleList = async (projectId: number) => {
  try {
    let formData = new FormData();
    formData.append('project_id', projectId);

    const response = await apiPost(API_ENDPOINTS.PROJECT_MODULE_LIST, formData);

    if (response.success) {
      return response.data; // Return the module list
    } else {
      return []; // Return an empty list if there's an error
    }
  } catch (error) {
    if (error instanceof Error)
      console.error('Error fetching module list:', error.message);
    return [];
  }
};

export const addModule = async (formData: FormData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.ADD_PROJECT_MODULE, formData);

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
