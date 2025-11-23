import { Request, Response } from 'express';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import { reviews, products, orders, orderItems } from '../db/schema';
import { insertReviewSchema } from '@vue-eshop/shared';

// Get product reviews
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const productReviews = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit: limitNum,
      offset,
      orderBy: desc(reviews.createdAt),
    });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    res.json({
      success: true,
      data: productReviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
    });
  }
};

// Create review
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const { productId } = req.params;
    const validatedData = insertReviewSchema.parse({
      ...req.body,
      userId: req.user.id,
      productId,
    });

    // Check if product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.productId, productId),
        eq(reviews.userId, req.user.id)
      ),
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
      return;
    }

    // Check if user purchased this product (verified purchase)
    const userOrder = await db
      .select()
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.userId, req.user.id),
          eq(orderItems.productId, productId),
          eq(orders.isPaid, true)
        )
      )
      .limit(1);

    const isVerifiedPurchase = userOrder.length > 0;

    // Create review
    const [newReview] = await db
      .insert(reviews)
      .values({
        ...validatedData,
        isVerifiedPurchase,
      })
      .returning();

    // Update product rating
    const allReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await db
      .update(products)
      .set({
        rating: avgRating.toFixed(2),
        numReviews: allReviews.length,
      })
      .where(eq(products.id, productId));

    // Fetch the created review with user info
    const reviewWithUser = await db.query.reviews.findFirst({
      where: eq(reviews.id, newReview.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: reviewWithUser,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
    });
  }
};

// Update review
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;

    // Check if review exists and belongs to user
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    if (review.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
      return;
    }

    const { rating, title, description } = req.body;

    const [updatedReview] = await db
      .update(reviews)
      .set({
        rating,
        title,
        description,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();

    // Update product rating
    const allReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, review.productId));

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await db
      .update(products)
      .set({
        rating: avgRating.toFixed(2),
      })
      .where(eq(products.id, review.productId));

    const reviewWithUser = await db.query.reviews.findFirst({
      where: eq(reviews.id, updatedReview.id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: reviewWithUser,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
    });
  }
};

// Delete review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;

    // Check if review exists
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, id),
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    // Allow deletion if user is the author or admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
      return;
    }

    const productId = review.productId;

    await db.delete(reviews).where(eq(reviews.id, id));

    // Update product rating
    const allReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId));

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / allReviews.length;

      await db
        .update(products)
        .set({
          rating: avgRating.toFixed(2),
          numReviews: allReviews.length,
        })
        .where(eq(products.id, productId));
    } else {
      await db
        .update(products)
        .set({
          rating: '0',
          numReviews: 0,
        })
        .where(eq(products.id, productId));
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
    });
  }
};
