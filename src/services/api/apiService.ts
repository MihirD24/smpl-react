import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { API_ENDPOINTS } from '../../constant/apiEndpoint';

const PUBLIC_API_ROUTES = [API_ENDPOINTS.AUTH.AUTHENTICATE_USER, API_ENDPOINTS.AUTH.VERIFY_OTP, API_ENDPOINTS.AUTH.RESEND_OTP];

// ─── Types ────────────────────────────────────────────────────────────────────

type MultipartPart =
  | { name: string; data: string }
  | { name: string; filename: string; type: string; data: string };

// ─── Helper: wait until authToken is present in AsyncStorage ─────────────────
// After login, AsyncStorage.setItem is async. If the dashboard mounts
// before setItem resolves, the interceptor reads null and the server
// returns 500 (unauthenticated). This polls until the token appears or
// the timeout (3 s) expires.

const waitForToken = (timeoutMs = 3000, intervalMs = 100): Promise<string | null> => {
  return new Promise(resolve => {
    const start = Date.now();

    const check = async () => {
      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        resolve(token);
        return;
      }

      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }

      setTimeout(check, intervalMs);
    };

    check();
  });
};

// ─── Multipart / blob helpers ─────────────────────────────────────────────────

const buildApiUrl = (endpoint: string): string => {
  const baseUrl = Config.API_BASE_URL || '';
  const separator = baseUrl.endsWith('/') || endpoint.startsWith('/') ? '' : '/';
  return `${baseUrl}${separator}${endpoint.replace(/^\//, '')}`;
};

const getUploadPath = (uri: string): string =>
  uri.startsWith('file://') ? uri.replace('file://', '') : uri;

const formDataToBlobParts = (formData: FormData): MultipartPart[] => {
  const parts = (formData as any)?._parts;

  if (!Array.isArray(parts)) {
    return [];
  }

  return parts.map(([name, value]: [string, any]) => {
    if (
      value &&
      typeof value === 'object' &&
      typeof value.uri === 'string' &&
      typeof value.name === 'string' &&
      typeof value.type === 'string'
    ) {
      return {
        name,
        filename: value.name,
        type: value.type,
        data: ReactNativeBlobUtil.wrap(getUploadPath(value.uri)),
      };
    }

    return {
      name,
      data: value == null ? '' : String(value),
    };
  });
};

const hasFormDataFile = (data: FormData): boolean => {
  const parts = (data as any)?._parts;

  if (!Array.isArray(parts)) {
    return false;
  }

  return parts.some((part: any[]) => {
    const value = part?.[1];
    return (
      value &&
      typeof value === 'object' &&
      typeof value.uri === 'string' &&
      typeof value.name === 'string' &&
      typeof value.type === 'string'
    );
  });
};

// ─── Axios instance ───────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 5000 * 10,
  headers: {
    Accept: 'application/json',
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  async config => {
    if (config.data instanceof FormData) {
      if (hasFormDataFile(config.data)) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      } else {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }

    if (config.url && PUBLIC_API_ROUTES.includes(config.url)) {
      return config;
    }

    const token = await waitForToken();

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('apiService: No auth token found after waiting. Request will proceed without token.');
    }

    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

// ─── Response interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error('Bad Request:', data.message || 'Invalid request.');
          break;
        case 401:
          console.error('Unauthorized: Token is invalid or expired. Redirecting to login.');
          AsyncStorage.removeItem('authToken');
          break;
        case 403:
          console.error('Forbidden: You do not have permission to access this resource.');
          break;
        case 404:
          console.log('Not Found:', data.message || 'The requested resource does not exist.');
          break;
        case 422:
          console.error('Validation Error:', data.errors || 'Invalid input.');
          break;
        case 500:
          console.error('Server Error: Something went wrong on the server.');
          break;
        default:
          console.error(`Unexpected Error [${status}]:`, data.message || 'An unknown error occurred.');
      }
    } else if (error.request) {
      console.error('Network Error: No response from server. Check your connection.');
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  },
);

// ─── Standard API methods ─────────────────────────────────────────────────────

export const apiGet = async (url: string, params = {}) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPost = async (url: string, data = {}) => {
  try {
    console.log('API POST:', url, data,'apiClient.defaults.baseURL:', apiClient.defaults.baseURL);
    if (!apiClient.defaults.baseURL) {
      throw new Error(
        'Missing API_BASE_URL (react-native-config). Check iOS Build Settings ENVFILE and your .env files.',
      );
    }
    const response = await apiClient.post(url, data, {
      timeout: 60000,
      transformRequest: data => data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiPut = async (url: string, data = {}) => {
  try {
    const response = await apiClient.put(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiDelete = async (url: string, data = {}) => {
  try {
    const response = await apiClient.delete(url, { data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ─── Multipart POST (ReactNativeBlobUtil) ─────────────────────────────────────
// Use this instead of apiPost whenever the FormData contains file attachments
// (images, documents, etc.). ReactNativeBlobUtil streams the file from disk
// rather than loading it into JS memory, which avoids OOM crashes on large files.

export const apiPostUpload = async (endpoint: string, formData: FormData) => {
  const token = await AsyncStorage.getItem('authToken');

  const response = await ReactNativeBlobUtil.fetch(
    'POST',
    buildApiUrl(endpoint),
    {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    formDataToBlobParts(formData),
  );

  return response.json();
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export const saveAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

export default apiClient;