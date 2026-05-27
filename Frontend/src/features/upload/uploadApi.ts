import axiosInstance from '@/services/axios';

export const uploadApi = {
  uploadSingle: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post('/upload/single', formData);
    return response.data.data;
  },

  uploadMultiple: async (files: File[]): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    const response = await axiosInstance.post('/upload/multiple', formData);
    return response.data.data;
  },
};
