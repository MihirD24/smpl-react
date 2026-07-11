import { apiPost, apiPostUpload } from './api/apiService';

export const getBranchList = async () => {
  try {
    const response = await apiPost('/branch-list');
    return response;
  } catch (error) {
    console.error('getBranchList error:', error);
    return { success: false, message: 'Failed to fetch branch list' };
  }
};

export const getEmployeeList = async () => {
  try {
    const response = await apiPost('/employee-list');
    return response;
  } catch (error) {
    console.error('getEmployeeList error:', error);
    return { success: false, message: 'Failed to fetch employee list' };
  }
};

export const getMachineModelsList = async () => {
  try {
    const response = await apiPost('/machine-model-list');
    return response;
  } catch (error) {
    console.error('getMachineModelsList error:', error);
    return { success: false, message: 'Failed to fetch machine models' };
  }
};

export const getPartyList = async () => {
  try {
    const response = await apiPost('/party-list');
    return response;
  } catch (error) {
    console.error('getPartyList error:', error);
    return { success: false, message: 'Failed to fetch customer parties' };
  }
};

export const getPartyByMachine = async (machineNo: string) => {
  try {
    const response = await apiPost('/service-visit-get-party-by-machine', { machine_no: machineNo });
    return response;
  } catch (error) {
    console.error('getPartyByMachine error:', error);
    return { success: false, message: 'Failed to search machine' };
  }
};

export const storeMachine = async (data: { name: string; machine_model_id: number; party_id: number }) => {
  try {
    const response = await apiPost('/service-visit-store-machine', data);
    return response;
  } catch (error) {
    console.error('storeMachine error:', error);
    return { success: false, message: 'Failed to add machine' };
  }
};

export const getDaAmount = async (params: {
  km: number;
  employee_id: number;
  visit_date: string;
  visit_id?: number;
  branch_id: number;
}) => {
  try {
    const response = await apiPost('/service-visit-get-da-amount', params);
    return response;
  } catch (error) {
    console.error('getDaAmount error:', error);
    return { success: false, message: 'Failed to calculate DA amount' };
  }
};

export const addServiceVisit = async (formData: FormData) => {
  try {
    // Since it contains potential file upload or needs multipart form, use apiPostUpload
    const response = await apiPostUpload('service-visit-add', formData);
    return response;
  } catch (error) {
    console.error('addServiceVisit error:', error);
    return { success: false, message: 'Failed to add service visit' };
  }
};

export const getServiceVisitsList = async (data: any = {}) => {
  try {
    const response = await apiPost('/service-visits-list', data);
    return response;
  } catch (error) {
    console.error('getServiceVisitsList error:', error);
    return { success: false, message: 'Failed to fetch service visits list' };
  }
};
