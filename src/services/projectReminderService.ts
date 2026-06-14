import { API_ENDPOINTS } from '../constant/apiEndpoint';
import { apiPost } from './api/apiService';
import {
  ProjectReminder,
  ReminderStatus,
} from '../screens/profile/projectRemain/reminderCard';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AddReminderPayload {
  party_id: string | number;
  reminder_type_id: string | number;
  status: ReminderStatus;
  remarks: string;
  start_date: string;
  end_date: string;
}

// ─── Services ─────────────────────────────────────────────────────────────────

// // Get Party List
export const getPartyLists = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.PARTY_LIST, {});

    if (response.success) {
      return {
        success: true,
        data: response.data as { id: number | string; name: string }[],
      };
    }
    return { success: false, message: response.message, data: [] };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching party list:', error.message);
    }
    return {
      success: false,
      message: 'An error occurred while fetching party list.',
      data: [],
    };
  }
};

// Get Reminder Type List
export const getReminderTypeList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.GET_REMINDER_TYPE, {});

    if (response.success) {
      return {
        success: true,
        data: response.data as {
          id: number | string;
          name: string;
          color?: string;
        }[],
      };
    }
    return { success: false, message: response.message, data: [] };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching reminder types:', error.message);
    }
    return {
      success: false,
      message: 'An error occurred while fetching reminder types.',
      data: [],
    };
  }
};

// Get Reminder List
export const getReminderList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.GET_REMINDER, {});

    if (response.success) {
      // Map API response shape → ProjectReminder shape
      const mapped: ProjectReminder[] = (response.data ?? []).map(
        (item: any) => ({
          id: item.id,
          party: {
            id: item.party_id,
            name: item.party?.name ?? '',
          },
          reminderType: {
            id: item.reminder_type_id,
            name: item.reminder_type?.name ?? '',
          },
          startTime: item.start_time ?? '',
          endTime: item.end_time ?? '',
          status: item.status as ReminderStatus,
          remarks: item.remarks ?? '',
        }),
      );
      return { success: true, data: mapped };
    }
    return { success: false, message: response.message, data: [] };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching reminder list:', error.message);
    }
    return {
      success: false,
      message: 'An error occurred while fetching reminders.',
      data: [],
    };
  }
};

// Add Reminder
export const addReminder = async (payload: AddReminderPayload) => {
  try {
    const response = await apiPost(API_ENDPOINTS.ADD_REMINDER, payload);

    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error adding reminder:', error.message);
    }
    return {
      success: false,
      message: 'An error occurred while adding the reminder.',
    };
  }
};
export const updateStatusByType = async (
  reminderId: number | string,
  newStatus: ReminderStatus,
  type: string,
) => {
  const formData = new FormData();
  formData.append('id', reminderId.toString());
  formData.append('type', type);
  formData.append('status', newStatus);

  try {
    const response = await apiPost(
      API_ENDPOINTS.UPDATE_STATUS_BY_TYPE,
      formData,
    );

    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating reminder status:', error.message);
    }
    return {
      success: false,
      message: 'An error occurred while updating the reminder status.',
    };
  }
};

export const getUsersList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.USERS_LIST);
    console.log('getUsersList response:', response);

    if (response.success) {
      return { success: true, data: response.data };
    }

    return { success: false, data: [] };
  } catch (error) {
    console.error('[getDevelopersList] Error:', error);
    return { success: false, data: [] };
  }
};
