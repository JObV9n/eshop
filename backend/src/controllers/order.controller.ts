import { Request, Response } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { orders, orderItems, carts, users } from '../db/schema';
import { insertOrderSchema, insertOrderItemSchema } from '@vue-eshop/shared';
import { sendOrderReceipt } from '../utils/email';

// Create new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const orderData = insertOrderSchema.parse({
      ...req.body,
      userId: req.user.id,
    });

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values(orderData)
      .returning();

    // Create order items
    const items = req.body.items || [];
    if (items.length > 0) {
      const orderItemsData = items.map((item: any) => ({
        ...insertOrderItemSchema.parse(item),
        orderId: newOrder.id,
      }));

      await db.insert(orderItems).values(orderItemsData);
    }

    // Clear user's cart
    const sessionCartId = req.cookies.sessionCartId;
    if (sessionCartId) {
      await db.delete(carts).where(
        and(
          eq(carts.userId, req.user.id),
          eq(carts.sessionCartId, sessionCartId)
        )
      );
    }

    // Fetch complete order with items for email
    const completeOrder = await db.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: {
        items: true,
      },
    });

    // Get user details for email
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
    });

    // Send order receipt email (non-blocking)
    if (completeOrder && user) {
      sendOrderReceipt(completeOrder, user.email, user.name).catch((err) =>
        console.error('Failed to send order receipt:', err)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { id: newOrder.id },
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

    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
    });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, req.user.id),
      orderBy: desc(orders.createdAt),
      with: {
        orderItems: true,
      },
    });

    res.json({
      success: true,
      data: userOrders,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: true,
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check authorization
    if (req.user?.role !== 'admin' && order.userId !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
    });
  }
};

// Update order payment status
export const updateOrderPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentResult } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check authorization
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      })
      .where(eq(orders.id, id))
      .returning();

    res.json({
      success: true,
      message: 'Order payment updated',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update order payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order payment',
    });
  }
};

// Update order delivery status (admin only)
export const updateOrderDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [updatedOrder] = await db
      .update(orders)
      .set({
        isDelivered: true,
        deliveredAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Order marked as delivered',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update order delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order delivery',
    });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: desc(orders.createdAt),
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
        orderItems: true,
      },
    });

    res.json({
      success: true,
      data: allOrders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};
