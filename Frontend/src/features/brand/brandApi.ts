import axiosInstance from '@/services/axios';

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export const brandApi = {
  getAllBrands: async (): Promise<Brand[]> => {
    const response = await axiosInstance.get('/brands');
    return response.data.data;
  },

  createBrand: async (data: any): Promise<Brand> => {
    const response = await axiosInstance.post('/brands', data);
    return response.data.data;
  },

  updateBrand: async (id: string, data: any): Promise<Brand> => {
    const response = await axiosInstance.patch(`/brands/${id}`, data);
    return response.data.data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/brands/${id}`);
  },
};
