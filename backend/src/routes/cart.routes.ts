import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Cart routes (work with or without auth)
router.get('/', optionalAuth, getCart);
router.post('/items', optionalAuth, addItemToCart);
router.put('/items/:productId', optionalAuth, updateCartItem);
router.delete('/items/:productId', optionalAuth, removeCartItem);
router.delete('/', optionalAuth, clearCart);

export default router;
