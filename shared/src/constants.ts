// Application Constants
export const APP_NAME = 'Eshop';
export const APP_DESCRIPTION = 'A modern ecommerce store built with Vue.js';

// Product Constants
export const LATEST_PRODUCTS_LIMIT = 4;
export const PAGE_SIZE = 12;

// Auth Constants
export const USER_ROLES = ['admin', 'user'] as const;

// Payment Constants
export const PAYMENT_METHODS = ['PayPal', 'Stripe', 'CashOnDelivery'] as const;
export const DEFAULT_PAYMENT_METHOD = 'PayPal';

// Default Values
export const signInDefaultValues = {
  email: 'admin@example.com',
  password: '123456',
};

export const signUpDefaultValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export const shippingAddressDefaultValues = {
  fullName: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  country: '',
};

export const productDefaultValues = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: '0',
  stock: 0,
  rating: '0',
  numReviews: 0,
  isFeatured: false,
  banner: null,
};

export const reviewFormDefaultValues = {
  title: '',
  description: '',
  rating: 0,
};

// Shipping & Tax Constants
export const SHIPPING_PRICE_THRESHOLD = 100;
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_PRICE = 10;
export const TAX_RATE = 0.15;

// Price Calculation
export const calculateItemsPrice = (items: { price: string; qty: number }[]): string => {
  const total = items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
  return total.toFixed(2);
};

export const calculateShippingPrice = (itemsPrice: number): string => {
  return itemsPrice >= FREE_SHIPPING_THRESHOLD ? '0.00' : SHIPPING_PRICE.toFixed(2);
};

export const calculateTaxPrice = (itemsPrice: number): string => {
  return (itemsPrice * TAX_RATE).toFixed(2);
};

export const calculateTotalPrice = (
  itemsPrice: number,
  shippingPrice: number,
  taxPrice: number
): string => {
  return (itemsPrice + shippingPrice + taxPrice).toFixed(2);
};

// Format Utilities
export const formatCurrency = (amount: number | string): string => {
  return `$${Number(amount).toFixed(2)}`;
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Utility Functions
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100;
};
