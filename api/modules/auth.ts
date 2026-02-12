import { request } from '../request';
import { User } from '../../types';

export const authApi = {
  getCaptcha: () => request.get<{ key: string, image: string }>('/auth/captcha'),
  
  login: (data: any) => request.post<{ token: string, user: User }>('/auth/login', data),
  
  getMe: () => request.get<{ user: User, menus: any[] }>('/auth/me'),
  
  updateProfile: (data: Partial<User>) => request.put<User>('/profile', data)
};