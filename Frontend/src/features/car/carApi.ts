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

  getSimilarCars: async (id: string): Promise<Car[]> => {
    const response = await axiosInstance.get(`/cars/${id}/similar`);
    return response.data.data;
  },

  getCarStats: async (id: string): Promise<{ buyersCount: number; reviewersCount: number }> => {
    const response = await axiosInstance.get(`/cars/${id}/stats`);
    return response.data.data;
  },

  createCar: async (data: any): Promise<Car> => {
    const response = await axiosInstance.post('/cars', data);
    return response.data.data;
  },

  updateCar: async (id: string, data: any): Promise<Car> => {
    const response = await axiosInstance.patch(`/cars/${id}`, data);
    return response.data.data;
  },

  deleteCar: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cars/${id}`);
  },
};
