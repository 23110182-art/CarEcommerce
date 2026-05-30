import axiosInstance from '@/services/axios';
import type { Review, Coupon } from './newFeaturesTypes';
import type { Car } from './carTypes';

export const reviewApi = {
  createReview: async (productId: string, rating: number, comment: string): Promise<Review> => {
    const response = await axiosInstance.post('/reviews', { productId, rating, comment });
    return response.data.data;
  },

  getReviews: async (productId: string): Promise<Review[]> => {
    const response = await axiosInstance.get(`/reviews/${productId}`);
    return response.data.data;
  },
};

export const wishlistApi = {
  toggleWishlist: async (productId: string): Promise<unknown> => {
    const response = await axiosInstance.post('/users/wishlist', { productId });
    return response.data.data;
  },

  getWishlist: async (): Promise<Car[]> => {
    const response = await axiosInstance.get('/users/wishlist');
    return response.data.data;
  },
};

export const viewedProductsApi = {
  addViewedProduct: async (productId: string): Promise<unknown> => {
    const response = await axiosInstance.post('/users/viewed-products', { productId });
    return response.data.data;
  },

  getViewedProducts: async (): Promise<Car[]> => {
    const response = await axiosInstance.get('/users/viewed-products');
    return response.data.data;
  },
};

export const couponApi = {
  getActiveCoupons: async (): Promise<Coupon[]> => {
    const response = await axiosInstance.get('/coupons/active');
    return response.data.data;
  },

  applyCoupon: async (code: string, orderValue: number): Promise<{ couponId: string; code: string; discountAmount: number }> => {
    const response = await axiosInstance.post('/coupons/apply', { code, orderValue });
    return response.data.data;
  },

  usePoints: async (points: number, orderValue: number): Promise<{ pointsUsed: number; pointsValue: number; finalValue: number }> => {
    const response = await axiosInstance.post('/coupons/use-points', { points, orderValue });
    return response.data.data;
  },

  // Admin coupon endpoints
  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await axiosInstance.get('/coupons');
    return response.data.data;
  },

  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await axiosInstance.post('/coupons', data);
    return response.data.data;
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await axiosInstance.put(`/coupons/${id}`, data);
    return response.data.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/coupons/${id}`);
  },
};
