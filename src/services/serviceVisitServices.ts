import { apiPost, apiPostUpload } from './api/apiService';
import { API_ENDPOINTS } from '../constant/apiEndpoint';

export const getBranchList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.BRANCH_LIST);
    return response;
  } catch (error) {
    console.error('getBranchList error:', error);
    return { success: false, message: 'Failed to fetch branch list' };
  }
};

export const getEmployeeList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.EMPLOYEE_LIST);
    return response;
  } catch (error) {
    console.error('getEmployeeList error:', error);
    return { success: false, message: 'Failed to fetch employee list' };
  }
};

export const getMachineModelsList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.MACHINE_MODEL_LIST);
    return response;
  } catch (error) {
    console.error('getMachineModelsList error:', error);
    return { success: false, message: 'Failed to fetch machine models' };
  }
};

export const getPartyList = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.PARTY_LIST);
    return response;
  } catch (error) {
    console.error('getPartyList error:', error);
    return { success: false, message: 'Failed to fetch customer parties' };
  }
};

export const getPartyByMachine = async (machineNo: string) => {
  try {
    const formData = new FormData();
    formData.append('machine_no', machineNo);
    const response = await apiPost(API_ENDPOINTS.SERVICE_VISIT_GET_PARTY_BY_MACHINE, formData);
    // console.log('getPartyByMachine response:', response);
    return response;
  } catch (error) {
    console.error('getPartyByMachine error:', error);
    return { success: false, message: 'Failed to search machine' };
  }
};

export const storeMachine = async (data: { name: string; machine_model_id: number; party_id: number }) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('machine_model_id', String(data.machine_model_id));
    formData.append('party_id', String(data.party_id));
    const response = await apiPost(API_ENDPOINTS.SERVICE_VISIT_STORE_MACHINE, formData);
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
    const formData = new FormData();
    formData.append('km', String(params.km));
    formData.append('employee_id', String(params.employee_id));
    formData.append('visit_date', params.visit_date);
    if (params.visit_id !== undefined && params.visit_id !== null) {
      formData.append('visit_id', String(params.visit_id));
    }
    formData.append('branch_id', String(params.branch_id));
    const response = await apiPost(API_ENDPOINTS.SERVICE_VISIT_GET_DA_AMOUNT, formData);
    return response;
  } catch (error) {
    console.error('getDaAmount error:', error);
    return { success: false, message: 'Failed to calculate DA amount' };
  }
};

export const addServiceVisit = async (formData: FormData) => {
  try {
    // Since it contains potential file upload or needs multipart form, use apiPostUpload
    const response = await apiPostUpload(API_ENDPOINTS.SERVICE_VISIT_ADD, formData);
    return response;
  } catch (error) {
    console.error('addServiceVisit error:', error);
    return { success: false, message: 'Failed to add service visit' };
  }
};

export const getServiceVisitsList = async (data: any = {}) => {
  try {
    const response = await apiPost(API_ENDPOINTS.SERVICE_VISITS_LIST, data);
    return response;

  } catch (error) {
    console.error('getServiceVisitsList error:', error);
    return { success: false, message: 'Failed to fetch service visits list' };
  }
};
