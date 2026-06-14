import { API_ENDPOINTS } from '../constant/apiEndpoint';
import { apiPost } from './api/apiService';

// ─── Types ───────────────────────────────────────────────────────────────

export interface ProjectRemainingPayload {
  project_id: string | number;
  details: string;
  employee_ids: (string | number)[];
  status: 'Pending' | 'Completed';
}

// ─── Services ────────────────────────────────────────────────────────────

// Get Remaining Points
export const getProjectRemainPoint = async () => {
  try {
    const response = await apiPost(
      API_ENDPOINTS.GET_PROJECT_REMAINING_POINT,
      {},
    );

    if (response.success) {
      return response.data;
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching project remaining points:', error.message);
    }

    return {
      success: false,
      message: 'An error occurred while fetching project remaining points.',
    };
  }
};

// Add Remaining Point
export const addProjectRemainPoint = async (
  payload: ProjectRemainingPayload,
) => {
  try {
    // ── Build FormData ──────────────────────────────────────────────────
    const formData = new FormData();
    formData.append('project_id', String(payload.project_id));
    formData.append('details', payload.details);
    formData.append('status', payload.status);

    // Pass employee_ids as a JSON string: "[14,18]"
    formData.append('employee_ids', JSON.stringify(payload.employee_ids));

    const response = await apiPost(
      API_ENDPOINTS.ADD_PROJECT_REMAINING_POINT,
      formData,
    );

    if (response.success) {
      return { success: true, message: response.message };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error adding project remaining point:', error.message);
    }

    return {
      success: false,
      message: 'An error occurred while adding the project remaining point.',
    };
  }
};

// Get Employees by Project
export const getEmployeeByProject = async (formData: FormData) => {
  try {
    const response = await apiPost(
      API_ENDPOINTS.GET_PROJECT_BY_EMPLOYEE,
      formData,
    );

    if (response.success) {
      return response.data;
    } else {
      return {
        success: false,
        message: response.message,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching employee by project', error.message);
    }

    return {
      success: false,
      message: 'An error occurred while fetching project remaining points.',
    };
  }
};