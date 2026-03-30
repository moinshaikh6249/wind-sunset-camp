import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const rawApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
const cleanedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');
const normalizedApiBaseUrl = cleanedApiBaseUrl
  ? (cleanedApiBaseUrl.endsWith('/api') ? cleanedApiBaseUrl : `${cleanedApiBaseUrl}/api`)
  : '';
export const API_BASE_URL = normalizedApiBaseUrl;

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type ApiResponse<T = any> = Promise<T>;

type RequestConfig = AxiosRequestConfig;

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken')
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const hasAdminToken = !!localStorage.getItem('adminToken');
        const hasUserToken = !!(localStorage.getItem('token') || localStorage.getItem('authToken'));

        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        window.location.href = hasAdminToken && !hasUserToken ? '/admin/login' : '/login';
      }
    }
    throw error;
  }
);

const apiClient = {
  get<T = any>(url: string, config?: RequestConfig): ApiResponse<T> {
    return api.get<T>(url, config).then((response) => response.data);
  },
  post<T = any>(url: string, data?: unknown, config?: RequestConfig): ApiResponse<T> {
    return api.post<T>(url, data, config).then((response) => response.data);
  },
  put<T = any>(url: string, data?: unknown, config?: RequestConfig): ApiResponse<T> {
    return api.put<T>(url, data, config).then((response) => response.data);
  },
  patch<T = any>(url: string, data?: unknown, config?: RequestConfig): ApiResponse<T> {
    return api.patch<T>(url, data, config).then((response) => response.data);
  },
  delete<T = any>(url: string, config?: RequestConfig): ApiResponse<T> {
    return api.delete<T>(url, config).then((response) => response.data);
  },
};

export default apiClient;
