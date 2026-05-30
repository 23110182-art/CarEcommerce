export interface Review {
  _id: string;
  user: {
    _id: string;
    username?: string;
    name?: string;
  };
  product: string;
  rating: number;
  comment: string;
  rewardCoupon?: string;
  rewardPoints?: number;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  isActive: boolean;
}