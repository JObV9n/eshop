import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { carts, products } from '../db/schema';
import { cartItemSchema, insertCartSchema } from '@vue-eshop/shared';
import { generateSessionId } from '../utils/auth';

// Helper function to calculate cart prices
const calcPrice = (items: any[]) => {
  const itemsPrice = items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = 0.15 * itemsPrice;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

// Get user's cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    let sessionCartId = req.cookies.sessionCartId || req.headers['x-session-cart-id'] as string;

    // Generate session cart ID if not exists
    if (!sessionCartId) {
      sessionCartId = generateSessionId();
      res.cookie('sessionCartId', sessionCartId, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    // Find cart by user ID or session ID
    const cart = await db.query.carts.findFirst({
      where: userId 
        ? eq(carts.userId, userId)
        : eq(carts.sessionCartId, sessionCartId),
    });

    if (!cart) {
      res.json({
        success: true,
        data: null,
      });
      return;
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
    });
  }
};

// Add item to cart
export const addItemToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    let sessionCartId = req.cookies.sessionCartId || req.headers['x-session-cart-id'] as string;

    // Generate session cart ID if not exists
    if (!sessionCartId) {
      sessionCartId = generateSessionId();
      res.cookie('sessionCartId', sessionCartId, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    // Validate item
    const item = cartItemSchema.parse(req.body);

    // Check if product exists and has stock
    const product = await db.query.products.findFirst({
      where: eq(products.id, item.productId),
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (product.stock < item.qty) {
      res.status(400).json({
        success: false,
        message: 'Not enough stock',
      });
      return;
    }

    // Find existing cart
    const existingCart = await db.query.carts.findFirst({
      where: userId 
        ? eq(carts.userId, userId)
        : eq(carts.sessionCartId, sessionCartId),
    });

    if (!existingCart) {
      // Create new cart
      const prices = calcPrice([item]);
      const newCart = insertCartSchema.parse({
        userId,
        sessionCartId,
        items: [item],
        ...prices,
      });

      const [createdCart] = await db.insert(carts).values(newCart).returning();

      res.status(201).json({
        success: true,
        message: `${product.name} added to cart`,
        data: createdCart,
      });
      return;
    }

    // Update existing cart
    const cartItems = existingCart.items as any[];
    const existingItemIndex = cartItems.findIndex((x: any) => x.productId === item.productId);

    if (existingItemIndex !== -1) {
      // Update quantity
      const newQty = cartItems[existingItemIndex].qty + item.qty;
      
      if (product.stock < newQty) {
        res.status(400).json({
          success: false,
          message: 'Not enough stock',
        });
        return;
      }

      cartItems[existingItemIndex].qty = newQty;
    } else {
      // Add new item
      cartItems.push(item);
    }

    const prices = calcPrice(cartItems);
    const [updatedCart] = await db
      .update(carts)
      .set({
        items: cartItems,
        ...prices,
      })
      .where(eq(carts.id, existingCart.id))
      .returning();

    res.json({
      success: true,
      message: `${product.name} added to cart`,
      data: updatedCart,
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

    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { qty } = req.body;
    const userId = req.user?.id;
    const sessionCartId = req.cookies.sessionCartId || req.headers['x-session-cart-id'];

    if (!qty || qty < 1) {
      res.status(400).json({
        success: false,
        message: 'Invalid quantity',
      });
      return;
    }

    // Find cart
    const cart = await db.query.carts.findFirst({
      where: userId 
        ? eq(carts.userId, userId)
        : eq(carts.sessionCartId, sessionCartId as string),
    });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    // Update item quantity
    const cartItems = cart.items as any[];
    const itemIndex = cartItems.findIndex((x: any) => x.productId === productId);

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
      return;
    }

    // Check stock
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product || product.stock < qty) {
      res.status(400).json({
        success: false,
        message: 'Not enough stock',
      });
      return;
    }

    cartItems[itemIndex].qty = qty;
    const prices = calcPrice(cartItems);

    const [updatedCart] = await db
      .update(carts)
      .set({
        items: cartItems,
        ...prices,
      })
      .where(eq(carts.id, cart.id))
      .returning();

    res.json({
      success: true,
      message: 'Cart updated',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
    });
  }
};

// Remove item from cart
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;
    const sessionCartId = req.cookies.sessionCartId || req.headers['x-session-cart-id'];

    // Find cart
    const cart = await db.query.carts.findFirst({
      where: userId 
        ? eq(carts.userId, userId)
        : eq(carts.sessionCartId, sessionCartId as string),
    });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    // Remove item
    const cartItems = (cart.items as any[]).filter((x: any) => x.productId !== productId);

    if (cartItems.length === 0) {
      // Delete cart if empty
      await db.delete(carts).where(eq(carts.id, cart.id));
      
      res.json({
        success: true,
        message: 'Cart cleared',
        data: null,
      });
      return;
    }

    const prices = calcPrice(cartItems);
    const [updatedCart] = await db
      .update(carts)
      .set({
        items: cartItems,
        ...prices,
      })
      .where(eq(carts.id, cart.id))
      .returning();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: updatedCart,
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
    });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionCartId = req.cookies.sessionCartId || req.headers['x-session-cart-id'];

    const cart = await db.query.carts.findFirst({
      where: userId 
        ? eq(carts.userId, userId)
        : eq(carts.sessionCartId, sessionCartId as string),
    });

    if (cart) {
      await db.delete(carts).where(eq(carts.id, cart.id));
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
    });
  }
};
