import axiosInstance from '@/services/axios';
import type { Car } from './carTypes';

export const carApi = {
  getFeaturedCars: async (): Promise<Car[]> => {
    const response = await axiosInstance.get('/cars/featured');
    return response.data.data;
  },

  getNewestCars: async (): Promise<Car[]> => {
    const response = await axiosInstance.get('/cars/newest');
    return response.data.data;
  },

  getBestSellerCars: async (): Promise<Car[]> => {
    const response = await axiosInstance.get('/cars/best-sellers');
    return response.data.data;
  },

  getAllCars: async (params?: any): Promise<{ cars: Car[], pagination: any }> => {
    const response = await axiosInstance.get('/cars', { params });
    return response.data.data;
  },

  getCarDetail: async (idOrSlug: string): Promise<Car> => {
    const response = await axiosInstance.get(`/cars/${idOrSlug}`);
    return response.data.data;
  },
};
