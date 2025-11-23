import { Request, Response } from 'express';
import { eq, desc, sql, ilike, and } from 'drizzle-orm';
import { db } from '../db';
import { products } from '../db/schema';
import { insertProductSchema, updateProductSchema } from '@vue-eshop/shared';
import slugify from 'slugify';

// Get all products with filters and pagination
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [];
    if (category) conditions.push(eq(products.category, category as string));
    if (brand) conditions.push(eq(products.brand, brand as string));
    if (search) conditions.push(ilike(products.name, `%${search}%`));
    if (minPrice) conditions.push(sql`CAST(${products.price} AS DECIMAL) >= ${parseFloat(minPrice as string)}`);
    if (maxPrice) conditions.push(sql`CAST(${products.price} AS DECIMAL) <= ${parseFloat(maxPrice as string)}`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get products
    const productsList = await db.query.products.findMany({
      where: whereClause,
      limit: limitNum,
      offset,
      orderBy: order === 'asc' ? products[sortBy as keyof typeof products] : desc(products[sortBy as keyof typeof products]),
    });

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause);

    res.json({
      success: true,
      data: productsList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
    });
  }
};

// Get latest products
export const getLatestProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;
    
    const latestProducts = await db.query.products.findMany({
      limit,
      orderBy: desc(products.createdAt),
    });

    res.json({
      success: true,
      data: latestProducts,
    });
  } catch (error) {
    console.error('Get latest products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest products',
    });
  }
};

// Get featured products
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const featuredProducts = await db.query.products.findMany({
      where: eq(products.isFeatured, true),
      orderBy: desc(products.createdAt),
    });

    res.json({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
    });
  }
};

// Get product by slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
    });
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await db
      .selectDistinct({ category: products.category })
      .from(products)
      .orderBy(products.category);

    res.json({
      success: true,
      data: categories.map(c => c.category),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
    });
  }
};

// Create product (admin only)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = insertProductSchema.parse(req.body);

    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = slugify(validatedData.name, { lower: true, strict: true });
    }

    const [newProduct] = await db
      .insert(products)
      .values(validatedData)
      .returning();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
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

    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
    });
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse({ ...req.body, id });

    const [updatedProduct] = await db
      .update(products)
      .set(validatedData)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
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

    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
    });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deletedProduct) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
    });
  }
};
