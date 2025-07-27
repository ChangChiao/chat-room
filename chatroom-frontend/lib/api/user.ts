import api from '@/lib/axios';
import { User } from '@/types';

export const userApi = {
  searchUsers: (query: string) => 
    api.get<User[]>('/users/search', { params: { q: query } }),
  
  getUser: (userId: string) => 
    api.get<User>(`/users/${userId}`),
  
  updateProfile: (data: Partial<User>) => 
    api.patch<User>('/users/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<{ url: string }>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};