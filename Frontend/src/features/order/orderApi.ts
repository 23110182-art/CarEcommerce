import axiosInstance from '@/services/axios';
import type {
  ApiResponse,
  Order,
  OrderCreateInput,
  OrderListPayload,
  OrderListParams,
} from './orderTypes';

const buildQueryString = (params?: OrderListParams) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const orderQueryKeys = {
  all: ['orders'] as const,
  lists: () => [...orderQueryKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderQueryKeys.lists(), params] as const,
  mine: (params: OrderListParams) => [...orderQueryKeys.all, 'mine', params] as const,
  detail: (id: string) => [...orderQueryKeys.all, 'detail', id] as const,
};

export const createCodOrder = async (payload: OrderCreateInput): Promise<Order> => {
  const { data } = await axiosInstance.post<ApiResponse<Order>>('/orders', payload);

  return data.data;
};

export const getMyOrders = async (params?: OrderListParams): Promise<OrderListPayload> => {
  const { data } = await axiosInstance.get<ApiResponse<OrderListPayload>>(`/orders${buildQueryString(params)}`);
  return data.data;
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  const { data } = await axiosInstance.get<ApiResponse<Order>>(`/orders/${orderId}`);
  return data.data;
};

export const getAdminOrders = async (params?: OrderListParams): Promise<OrderListPayload> => {
  const { data } = await axiosInstance.get<ApiResponse<OrderListPayload>>(`/orders${buildQueryString(params)}`);
  return data.data;
};

export const updateOrderStatus = async (
  orderId: string,
  payload: { status: Order['status'] }
): Promise<Order> => {
  const { data } = await axiosInstance.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, payload);
  return data.data;
};

export const requestCancelOrder = async (
  orderId: string,
  payload: { reason?: string }
): Promise<Order> => {
  const { data } = await axiosInstance.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`, payload);
  return data.data;
};

export const reviewCancelRequest = async (
  orderId: string,
  payload: { action: 'approve' | 'reject'; adminNote?: string }
): Promise<Order> => {
  const { data } = await axiosInstance.patch<ApiResponse<Order>>(`/orders/${orderId}/cancel-request`, payload);
  return data.data;
};
