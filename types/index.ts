// TypeScript type definitions

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
  userId: string;
}

export interface OrderResponse {
  id: string;
  userId: string;
  description: string;
  totalPrice: number;
  status: string;
  orderProducts?: OrderProductResponse[];
}

export interface OrderProductResponse {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  product?: ProductResponse;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

