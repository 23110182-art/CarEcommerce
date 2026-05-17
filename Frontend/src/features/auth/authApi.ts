import axiosInstance from '@/services/axios';
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput
} from './authSchemas';

export const authApi = {
  register: async (data: RegisterInput) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpInput) => {
    const response = await axiosInstance.post('/auth/verify-otp', data);
    return response.data;
  },

  login: async (data: LoginInput) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const response = await axiosInstance.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordInput) => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },
};
