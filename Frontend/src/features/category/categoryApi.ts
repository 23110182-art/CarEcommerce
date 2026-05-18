import axiosInstance from '@/services/axios';

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export const categoryApi = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get('/categories');
    return response.data.data;
  },

  createCategory: async (data: { name: string }): Promise<Category> => {
    const response = await axiosInstance.post('/categories', data);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};
