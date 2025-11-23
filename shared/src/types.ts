import { z } from 'zod';
import {
  insertProductSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  paymentResultSchema,
  insertReviewSchema,
} from './validators';

// Product Types
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  numReviews: number;
  createdAt: Date;
};

// Cart Types
export type Cart = z.infer<typeof insertCartSchema> & {
  id: string;
  createdAt: Date;
};

export type CartItem = z.infer<typeof cartItemSchema>;

// Shipping Types
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// Order Types
export type OrderItem = z.infer<typeof insertOrderItemSchema>;

export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderitems: OrderItem[];
  user: { name: string; email: string };
  paymentResult?: PaymentResult;
};

export type PaymentResult = z.infer<typeof paymentResultSchema>;

// Review Types
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
  isVerifiedPurchase: boolean;
};

// User Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  address?: ShippingAddress | null;
  paymentMethod?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Auth Types
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  refreshToken?: string;
};

// API Response Types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type PaginatedResponse<T = any> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
