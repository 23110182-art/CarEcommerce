export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type CancelRequestStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface OrderItem {
  car: string | {
    _id: string;
    name?: string;
    price?: number;
    stock?: number;
    images?: Array<{ url?: string } | string>;
    status?: string;
  };
  carName: string;
  carImage?: string | null;
  salePrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderCustomer {
  user: string | {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
  name: string;
  email?: string;
  phone?: string;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export interface CancelRequest {
  status: CancelRequestStatus;
  reason?: string;
  requested_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  admin_note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  shippingInfo: ShippingInfo;
  items: OrderItem[];
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cancel_request?: CancelRequest;
  note?: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  delivered_at?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreateInput {
  items: Array<{ car: string; quantity: number }>;
  shippingInfo: ShippingInfo;
  note?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderListPayload {
  orders: Order[];
  pagination: PaginationMeta;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  cancelRequestStatus?: string;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}
