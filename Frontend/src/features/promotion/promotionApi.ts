import axiosInstance from "@/services/axios";

export interface Promotion {
  _id: string;
  name: string;
  description: string;
  discount_type: "percentage" | "amount";
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  apply_to: "all" | "brand" | "category" | "specific_cars";
  applicable_brands?: { _id: string; name: string }[];
  applicable_categories?: { _id: string; name: string }[];
  applicable_cars?: { _id: string; name: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export const promotionApi = {
  getAllPromotions: async (): Promise<Promotion[]> => {
    const response = await axiosInstance.get("/promotions");
    return response.data.data;
  },

  getPromotion: async (id: string): Promise<Promotion> => {
    const response = await axiosInstance.get(`/promotions/${id}`);
    return response.data.data;
  },

  createPromotion: async (data: any): Promise<Promotion> => {
    const response = await axiosInstance.post("/promotions", data);
    return response.data.data;
  },

  updatePromotion: async (id: string, data: any): Promise<Promotion> => {
    const response = await axiosInstance.put(`/promotions/${id}`, data);
    return response.data.data;
  },

  deletePromotion: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/promotions/${id}`);
  },

  calculatePromotionForCar: async (
    carId: string,
  ): Promise<{
    sale_price?: number;
    applied_promotion?: {
      _id: string;
      name: string;
      description: string;
      discount_type: string;
      discount_value: number;
      end_date: string;
    };
  } | null> => {
    const response = await axiosInstance.get(`/promotions/calculate/${carId}`);
    return response.data.data;
  },
};
