import { pgTable, uuid, varchar, text, integer, decimal, boolean, timestamp, json, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().default('NO_NAME'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  address: json('address').$type<{
    fullName: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    lat?: number;
    lng?: number;
  }>(),
  paymentMethod: varchar('paymentMethod', { length: 50 }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

// Products Table
export const products = pgTable('Product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 100 }).notNull(),
  images: text('images').array().notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  description: text('description').notNull(),
  stock: integer('stock').notNull().default(0),
  price: decimal('price', { precision: 12, scale: 2 }).notNull().default('0'),
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  numReviews: integer('numReviews').notNull().default(0),
  isFeatured: boolean('isFeatured').notNull().default(false),
  banner: text('banner'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// Cart Table
export const carts = pgTable('Cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
  sessionCartId: varchar('sessionCartId', { length: 255 }).notNull(),
  items: json('items').notNull().default([]).$type<Array<{
    productId: string;
    name: string;
    slug: string;
    qty: number;
    image: string;
    price: string;
  }>>(),
  itemsPrice: decimal('itemsPrice', { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal('totalPrice', { precision: 12, scale: 2 }).notNull(),
  shippingPrice: decimal('shippingPrice', { precision: 12, scale: 2 }).notNull(),
  taxPrice: decimal('taxPrice', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// Orders Table
export const orders = pgTable('Order', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  shippingAddress: json('shippingAddress').notNull().$type<{
    fullName: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    lat?: number;
    lng?: number;
  }>(),
  paymentMethod: varchar('paymentMethod', { length: 50 }).notNull(),
  paymentResult: json('paymentResult').$type<{
    id: string;
    status: string;
    email_address: string;
    pricePaid: string;
  }>(),
  itemsPrice: decimal('itemsPrice', { precision: 12, scale: 2 }).notNull(),
  shippingPrice: decimal('shippingPrice', { precision: 12, scale: 2 }).notNull(),
  taxPrice: decimal('taxPrice', { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal('totalPrice', { precision: 12, scale: 2 }).notNull(),
  isPaid: boolean('isPaid').notNull().default(false),
  paidAt: timestamp('paidAt', { mode: 'date' }),
  isDelivered: boolean('isDelivered').notNull().default(false),
  deliveredAt: timestamp('deliveredAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// Order Items Table
export const orderItems = pgTable('OrderItem', {
  orderId: uuid('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  qty: integer('qty').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  image: text('image').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.orderId, table.productId] }),
}));

// Reviews Table
export const reviews = pgTable('Review', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  isVerifiedPurchase: boolean('isVerifiedPurchase').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  carts: many(carts),
  orders: many(orders),
  reviews: many(reviews),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));
