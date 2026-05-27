import axiosInstance from '@/services/axios';

export interface Banner {
  _id: string;
  title: string;
  image: string;
  link?: string;
  is_active: boolean;
  createdAt: string;
}

export const bannerApi = {
  getAllBanners: async (params?: any): Promise<Banner[]> => {
    const response = await axiosInstance.get('/banners', { params });
    return response.data.data;
  },

  createBanner: async (data: Partial<Banner>): Promise<Banner> => {
    const response = await axiosInstance.post('/banners', data);
    return response.data.data;
  },

  updateBanner: async (id: string, data: Partial<Banner>): Promise<Banner> => {
    const response = await axiosInstance.patch(`/banners/${id}`, data);
    return response.data.data;
  },

  deleteBanner: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/banners/${id}`);
  },
};
