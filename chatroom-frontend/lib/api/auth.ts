import api from '@/lib/axios';
import { AuthResponse, User } from '@/types';

export const authApi = {
  login: (email: string, password: string) => 
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) => 
    api.post<AuthResponse>('/auth/register', { email, password, name }),
  
  googleCallback: (code: string) => 
    api.post<AuthResponse>('/auth/google/callback', { code }),
  
  me: () => api.get<User>('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
};