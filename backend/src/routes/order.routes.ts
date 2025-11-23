import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderPayment,
  updateOrderDelivery,
  getAllOrders,
} from '../controllers/order.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Protected routes (user must be authenticated)
router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/pay', authenticate, updateOrderPayment);

// Admin routes
router.get('/', authenticate, isAdmin, getAllOrders);
router.put('/:id/deliver', authenticate, isAdmin, updateOrderDelivery);

export default router;
