import 'dotenv/config';
import { db } from './index';
import { users, products, reviews } from './schema';
import { hashPassword } from '../utils/auth';

// Samplet from Traversery Media
const sampleData = {
  users: [
    {
      name: 'John Admin',
      email: 'admin@example.com',
      password: '123456',
      role: 'admin' as const,
    },
    {
      name: 'Jane User',
      email: 'user@example.com',
      password: '123456',
      role: 'user' as const,
    },
  ],
  products: [
    {
      name: 'Polo Sporting Stretch Shirt',
      slug: 'polo-sporting-stretch-shirt',
      category: "Men's Dress Shirts",
      description: 'Classic Polo style with modern comfort',
      images: [
        '/images/sample-products/p1-1.jpg',
        '/images/sample-products/p1-2.jpg',
      ],
      price: '59.99',
      brand: 'Polo',
      rating: '4.5',
      numReviews: 10,
      stock: 5,
      isFeatured: true,
      banner: '/images/banner-1.jpg',
    },
    {
      name: 'Brooks Brothers Long Sleeved Shirt',
      slug: 'brooks-brothers-long-sleeved-shirt',
      category: "Men's Dress Shirts",
      description: 'Timeless style and premium comfort',
      images: [
        '/images/sample-products/p2-1.jpg',
        '/images/sample-products/p2-2.jpg',
      ],
      price: '85.90',
      brand: 'Brooks Brothers',
      rating: '4.2',
      numReviews: 8,
      stock: 10,
      isFeatured: true,
      banner: '/images/banner-2.jpg',
    },
    {
      name: 'Tommy Hilfiger Classic Fit Dress Shirt',
      slug: 'tommy-hilfiger-classic-fit-dress-shirt',
      category: "Men's Dress Shirts",
      description: 'A perfect blend of sophistication and comfort',
      images: [
        '/images/sample-products/p3-1.jpg',
        '/images/sample-products/p3-2.jpg',
      ],
      price: '99.95',
      brand: 'Tommy Hilfiger',
      rating: '4.9',
      numReviews: 3,
      stock: 0,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Calvin Klein Slim Fit Stretch Shirt',
      slug: 'calvin-klein-slim-fit-stretch-shirt',
      category: "Men's Dress Shirts",
      description: 'Streamlined design with flexible stretch fabric',
      images: [
        '/images/sample-products/p4-1.jpg',
        '/images/sample-products/p4-2.jpg',
      ],
      price: '39.95',
      brand: 'Calvin Klein',
      rating: '3.6',
      numReviews: 5,
      stock: 10,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Polo Ralph Lauren Oxford Shirt',
      slug: 'polo-ralph-lauren-oxford-shirt',
      category: "Men's Dress Shirts",
      description: 'Iconic Polo design with refined oxford fabric',
      images: [
        '/images/sample-products/p5-1.jpg',
        '/images/sample-products/p5-2.jpg',
      ],
      price: '79.99',
      brand: 'Polo',
      rating: '4.7',
      numReviews: 18,
      stock: 6,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Polo Classic Pink Hoodie',
      slug: 'polo-classic-pink-hoodie',
      category: "Men's Sweatshirts",
      description: 'Soft, stylish, and perfect for laid-back days',
      images: [
        '/images/sample-products/p6-1.jpg',
        '/images/sample-products/p6-2.jpg',
      ],
      price: '99.99',
      brand: 'Polo',
      rating: '4.6',
      numReviews: 12,
      stock: 8,
      isFeatured: true,
      banner: null,
    },
    {
      name: 'Nike Dri-FIT Training Shirt',
      slug: 'nike-dri-fit-training-shirt',
      category: "Men's Athletic Wear",
      description: 'Stay cool and dry during intense workouts',
      images: [
        '/images/sample-products/p7-1.jpg',
        '/images/sample-products/p7-2.jpg',
      ],
      price: '45.00',
      brand: 'Nike',
      rating: '4.8',
      numReviews: 25,
      stock: 15,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Adidas Essentials Hoodie',
      slug: 'adidas-essentials-hoodie',
      category: "Men's Sweatshirts",
      description: 'Comfortable everyday hoodie with classic 3-stripe design',
      images: [
        '/images/sample-products/p8-1.jpg',
        '/images/sample-products/p8-2.jpg',
      ],
      price: '65.00',
      brand: 'Adidas',
      rating: '4.4',
      numReviews: 15,
      stock: 12,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Under Armour Tech Polo',
      slug: 'under-armour-tech-polo',
      category: "Men's Athletic Wear",
      description: 'Performance polo with anti-odor technology',
      images: [
        '/images/sample-products/p9-1.jpg',
        '/images/sample-products/p9-2.jpg',
      ],
      price: '55.00',
      brand: 'Under Armour',
      rating: '4.3',
      numReviews: 8,
      stock: 20,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Levi\'s Classic Denim Shirt',
      slug: 'levis-classic-denim-shirt',
      category: "Men's Casual Shirts",
      description: 'Authentic denim shirt with timeless appeal',
      images: [
        '/images/sample-products/p10-1.jpg',
        '/images/sample-products/p10-2.jpg',
      ],
      price: '68.00',
      brand: 'Levi\'s',
      rating: '4.7',
      numReviews: 22,
      stock: 9,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Hugo Boss Slim-Fit Business Shirt',
      slug: 'hugo-boss-slim-fit-business-shirt',
      category: "Men's Dress Shirts",
      description: 'Premium business shirt with contemporary cut',
      images: [
        '/images/sample-products/p11-1.jpg',
        '/images/sample-products/p11-2.jpg',
      ],
      price: '129.00',
      brand: 'Hugo Boss',
      rating: '4.9',
      numReviews: 11,
      stock: 7,
      isFeatured: false,
      banner: null,
    },
    {
      name: 'Lacoste Classic Polo',
      slug: 'lacoste-classic-polo',
      category: "Men's Casual Shirts",
      description: 'Iconic polo shirt with crocodile logo',
      images: [
        '/images/sample-products/p12-1.jpg',
        '/images/sample-products/p12-2.jpg',
      ],
      price: '98.00',
      brand: 'Lacoste',
      rating: '4.6',
      numReviews: 19,
      stock: 14,
      isFeatured: true,
      banner: '/images/banner-3.jpg',
    },
  ],
};

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(users);

    // Seed users
    console.log('👥 Seeding users...');
    const createdUsers = [];
    for (const user of sampleData.users) {
      const hashedPassword = await hashPassword(user.password);
      const [newUser] = await db
        .insert(users)
        .values({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
        })
        .returning();
      createdUsers.push(newUser);
      console.log(`   ✓ Created user: ${newUser.email} (${newUser.role})`);
    }

    // Seed products
    console.log('📦 Seeding products...');
    const createdProducts = [];
    for (const product of sampleData.products) {
      const [newProduct] = await db
        .insert(products)
        .values(product)
        .returning();
      createdProducts.push(newProduct);
      console.log(`   ✓ Created product: ${newProduct.name}`);
    }

    // Seed sample reviews
    console.log('⭐ Seeding reviews...');
    const sampleReviews = [
      {
        userId: createdUsers[1].id, // Jane User
        productId: createdProducts[0].id, // Polo Sporting Stretch Shirt
        rating: 5,
        title: 'Excellent quality!',
        description: 'This shirt exceeded my expectations. The fabric is soft and the fit is perfect.',
        isVerifiedPurchase: true,
      },
      {
        userId: createdUsers[1].id,
        productId: createdProducts[1].id, // Brooks Brothers
        rating: 4,
        title: 'Great shirt, slightly pricey',
        description: 'Quality is outstanding but a bit expensive for my budget.',
        isVerifiedPurchase: true,
      },
      {
        userId: createdUsers[0].id, // John Admin
        productId: createdProducts[4].id, // Polo Ralph Lauren Oxford
        rating: 5,
        title: 'Classic and comfortable',
        description: 'Perfect oxford shirt. I have multiple colors now!',
        isVerifiedPurchase: false,
      },
      {
        userId: createdUsers[1].id,
        productId: createdProducts[5].id, // Polo Pink Hoodie
        rating: 5,
        title: 'Love this hoodie!',
        description: 'So comfortable and the color is beautiful. Gets compliments all the time.',
        isVerifiedPurchase: true,
      },
      {
        userId: createdUsers[0].id,
        productId: createdProducts[11].id, // Lacoste
        rating: 4,
        title: 'Worth the investment',
        description: 'Classic Lacoste quality. Fits true to size.',
        isVerifiedPurchase: false,
      },
    ];

    for (const review of sampleReviews) {
      const [newReview] = await db.insert(reviews).values(review).returning();
      console.log(`   ✓ Created review for product ID: ${newReview.productId}`);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Reviews: ${sampleReviews.length}`);
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@example.com / 123456');
    console.log('   User:  user@example.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
