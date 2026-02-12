import { delay } from '../utils';
import { APP_CONFIG } from '../config';

// 模拟 Axios 响应结构
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 简单的请求拦截器模拟
const requestInterceptor = (config: any) => {
  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
};

// 简单的响应拦截器模拟
const responseInterceptor = (response: ApiResponse<any>) => {
  if (response.code === 401) {
    // 模拟 Token 过期跳转
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    window.location.href = '#/login';
    throw new Error('Unauthorized');
  }
  return response;
};

export const request = {
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    // 模拟拦截器执行
    requestInterceptor({ url, params });
    console.log(`[API GET] ${APP_CONFIG.API_BASE_URL}${url}`, params);
    
    await delay(500); // 模拟网络延迟
    
    // 模拟响应
    const response = { code: 200, data: {} as T, message: 'Success' };
    return responseInterceptor(response);
  },
  
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    requestInterceptor({ url, data });
    console.log(`[API POST] ${APP_CONFIG.API_BASE_URL}${url}`, data);
    
    await delay(500);
    
    const response = { code: 200, data: {} as T, message: 'Success' };
    return responseInterceptor(response);
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    requestInterceptor({ url });
    console.log(`[API DELETE] ${APP_CONFIG.API_BASE_URL}${url}`);
    
    await delay(400);
    
    return responseInterceptor({ code: 200, data: {} as T, message: 'Deleted' });
  }
};