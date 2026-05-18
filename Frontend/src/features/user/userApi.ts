import axiosInstance from '@/services/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  phone?: string;
  address?: string;
  avatar?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
}

export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users');
    return response.data.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.patch(`/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/users/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data.data;
  },

  changePassword: async (data: any): Promise<void> => {
    await axiosInstance.patch('/users/profile/password', data);
  },
};
