import axios, { AxiosInstance, AxiosResponse } from 'https://esm.sh/axios@1.6.7';
import { APP_CONFIG } from '../config';
import { mockRequest } from './mock-server';

// Define Standard Response Wrapper
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// Create Instance
const service: AxiosInstance = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    
    // Assuming 200 is success code from backend
    if (res.code !== 200) {
      // Handle Business Errors
      if (res.code === 401) {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_INFO);
        window.location.href = '#/login';
      }
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      return res;
    }
  },
  (error) => {
    // Handle Network/Server Errors
    const msg = error.response?.data?.message || error.message || 'System Error';
    if (error.response?.status === 401) {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
        window.location.href = '#/login';
    }
    console.error('API Error:', msg);
    return Promise.reject(new Error(msg));
  }
);

// Universal Request Method that routes to Mock or Real Axios
const makeRequest = async <T>(config: any): Promise<ApiResponse<T>> => {
    if (APP_CONFIG.USE_MOCK_API) {
        try {
            const res = await mockRequest(config);
            if (res.code !== 200) throw new Error(res.message);
            return res as ApiResponse<T>;
        } catch (e: any) {
            console.error('Mock Request Failed', e);
            throw e;
        }
    }
    // Real Axios Call (Note: service methods return Promise<any> due to interceptor return type)
    return service.request(config) as Promise<ApiResponse<T>>;
};

// Wrapper methods
export const request = {
  get: <T>(url: string, params?: any) => makeRequest<T>({ url, method: 'get', params }),
  post: <T>(url: string, data?: any) => makeRequest<T>({ url, method: 'post', data }),
  put: <T>(url: string, data?: any) => makeRequest<T>({ url, method: 'put', data }),
  delete: <T>(url: string, data?: any) => makeRequest<T>({ url, method: 'delete', data }),
  download: (url: string, params?: any) => makeRequest<any>({ url, method: 'get', params, responseType: 'blob' })
};