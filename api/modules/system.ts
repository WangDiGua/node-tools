import { request } from '../request';
import { User, Role, SystemLog } from '../../types';

export const menuApi = {
  getList: () => request.get<any[]>('/settings/menus'),
  update: (id: number, data: any) => request.put(`/settings/menus/${id}`, data),
};

export const roleApi = {
  getList: () => request.get<Role[]>('/settings/roles'),
  create: (data: Partial<Role>) => request.post<Role>('/settings/roles', data),
  update: (id: string, data: Partial<Role>) => request.put<Role>(`/settings/roles/${id}`, data),
  delete: (id: string) => request.delete(`/settings/roles/${id}`),
  updatePermissions: (id: string, permissions: string[]) => request.put(`/settings/roles/${id}/permissions`, { permissions }),
};

export const userApi = {
  getList: (params?: any) => request.get<{ list: User[], total: number }>('/settings/users', params),
  create: (data: Partial<User>) => request.post<User>('/settings/users', data),
  update: (id: string, data: Partial<User>) => request.put<User>(`/settings/users/${id}`, data),
  toggleStatus: (id: string, status: string) => request.put(`/settings/users/${id}/status`, { status }),
  delete: (id: string) => request.delete(`/settings/users/${id}`),
};

export const securityApi = {
  getIps: (params?: any) => request.get<any[]>('/settings/ips', params),
  addBlock: (data: any) => request.post('/settings/ips', data),
  toggleBlock: (id: string, status: string) => request.put(`/settings/ips/${id}/status`, { status }),
};

export const logApi = {
  getList: (params?: any) => request.get<{ list: SystemLog[], total: number }>('/settings/logs', params),
  delete: (id: string) => request.delete(`/settings/logs/${id}`),
  setRetention: (days: number) => request.post('/settings/logs/retention', { days }),
};