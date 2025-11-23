import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateAddress,
  updatePaymentMethod,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// User routes (protected)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/address', authenticate, updateAddress);
router.put('/payment-method', authenticate, updatePaymentMethod);

// Admin routes
router.get('/', authenticate, isAdmin, getAllUsers);
router.get('/:id', authenticate, isAdmin, getUserById);
router.put('/:id', authenticate, isAdmin, updateUser);
router.delete('/:id', authenticate, isAdmin, deleteUser);

export default router;
