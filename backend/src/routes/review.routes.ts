import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get reviews for a product (public)
router.get('/products/:productId/reviews', getProductReviews);

// Create review (authenticated)
router.post('/products/:productId/reviews', authenticate, createReview);

// Update review (authenticated - owner only)
router.put('/reviews/:id', authenticate, updateReview);

// Delete review (authenticated - owner or admin)
router.delete('/reviews/:id', authenticate, deleteReview);

export default router;
