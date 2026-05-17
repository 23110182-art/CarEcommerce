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
};
