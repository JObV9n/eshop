import { Router } from 'express';
import {
  getAllProducts,
  getLatestProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/latest', getLatestProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getAllCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

export default router;
