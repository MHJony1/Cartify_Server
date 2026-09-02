import { prisma } from './src/app/lib/prisma';

const productsToAdd = [
  {
    name: 'Classic Basic T-Shirt',
    description: 'A timeless classic basic t-shirt made from 100% premium cotton. Perfect for everyday wear.',
    price: 19.99,
    slug: 'classic-basic-t-shirt',
    gender: 'MEN',
    material: 'Cotton',
    brand: 'Cartify Basics',
    categoryName: 'Men\'s Fashion',
    variants: [
      { size: 'S', color: 'Black', stock: 50, sku: 'TS-B-S' },
      { size: 'M', color: 'Black', stock: 100, sku: 'TS-B-M' },
      { size: 'L', color: 'Black', stock: 80, sku: 'TS-B-L' },
      { size: 'XL', color: 'Black', stock: 30, sku: 'TS-B-XL' },
      { size: 'M', color: 'White', stock: 60, sku: 'TS-W-M' },
      { size: 'L', color: 'White', stock: 60, sku: 'TS-W-L' },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'
    ]
  },
  {
    name: 'Vintage Wash Denim Jeans',
    description: 'Classic straight-fit denim jeans with a vintage wash finish. Durable and stylish.',
    price: 49.99,
    slug: 'vintage-wash-denim-jeans',
    gender: 'MEN',
    material: 'Denim',
    brand: 'DenimCo',
    categoryName: 'Men\'s Fashion',
    variants: [
      { size: '30', color: 'Blue', stock: 20, sku: 'JN-V-30' },
      { size: '32', color: 'Blue', stock: 40, sku: 'JN-V-32' },
      { size: '34', color: 'Blue', stock: 45, sku: 'JN-V-34' },
      { size: '36', color: 'Blue', stock: 15, sku: 'JN-V-36' },
      { size: '32', color: 'Black', stock: 30, sku: 'JN-B-32' },
      { size: '34', color: 'Black', stock: 30, sku: 'JN-B-34' },
    ],
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'
    ]
  },
  {
    name: 'Cozy Oversized Hoodie',
    description: 'Ultimate comfort meets street style. This oversized hoodie features a soft fleece interior.',
    price: 39.99,
    slug: 'cozy-oversized-hoodie',
    gender: 'UNISEX',
    material: 'Cotton Blend',
    brand: 'StreetWear',
    categoryName: 'Men\'s Fashion',
    variants: [
      { size: 'M', color: 'Grey', stock: 25, sku: 'HD-G-M' },
      { size: 'L', color: 'Grey', stock: 40, sku: 'HD-G-L' },
      { size: 'XL', color: 'Grey', stock: 20, sku: 'HD-G-XL' },
      { size: 'M', color: 'Navy', stock: 15, sku: 'HD-N-M' },
      { size: 'L', color: 'Navy', stock: 25, sku: 'HD-N-L' },
    ],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'
    ]
  },
  {
    name: 'Elegant Summer Wrap Dress',
    description: 'A beautiful floral wrap dress perfect for summer days and evenings. Lightweight and breathable.',
    price: 55.00,
    slug: 'elegant-summer-wrap-dress',
    gender: 'WOMEN',
    material: 'Viscose',
    brand: 'Flora Boutique',
    categoryName: 'Women\'s Fashion',
    variants: [
      { size: 'XS', color: 'Red Floral', stock: 10, sku: 'WD-R-XS' },
      { size: 'S', color: 'Red Floral', stock: 25, sku: 'WD-R-S' },
      { size: 'M', color: 'Red Floral', stock: 30, sku: 'WD-R-M' },
      { size: 'L', color: 'Red Floral', stock: 15, sku: 'WD-R-L' },
    ],
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80'
    ]
  },
  {
    name: 'Slim Fit Chino Pants',
    description: 'Versatile slim-fit chinos for a smart-casual look. Stretch fabric for maximum comfort.',
    price: 34.99,
    slug: 'slim-fit-chino-pants',
    gender: 'MEN',
    material: 'Cotton Spandex',
    brand: 'Cartify Basics',
    categoryName: 'Men\'s Fashion',
    variants: [
      { size: '30', color: 'Khaki', stock: 30, sku: 'CH-K-30' },
      { size: '32', color: 'Khaki', stock: 50, sku: 'CH-K-32' },
      { size: '34', color: 'Khaki', stock: 45, sku: 'CH-K-34' },
      { size: '32', color: 'Olive', stock: 35, sku: 'CH-O-32' },
      { size: '34', color: 'Olive', stock: 40, sku: 'CH-O-34' },
    ],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'
    ]
  },
  {
    name: 'Women\'s Classic Leather Jacket',
    description: 'A premium faux leather jacket with asymmetrical zip closure. Edgy and stylish.',
    price: 89.99,
    slug: 'womens-classic-leather-jacket',
    gender: 'WOMEN',
    material: 'Faux Leather',
    brand: 'UrbanEdge',
    categoryName: 'Women\'s Fashion',
    variants: [
      { size: 'S', color: 'Black', stock: 15, sku: 'LJ-B-S' },
      { size: 'M', color: 'Black', stock: 20, sku: 'LJ-B-M' },
      { size: 'L', color: 'Black', stock: 10, sku: 'LJ-B-L' },
    ],
    images: [
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80'
    ]
  },
  {
    name: 'Casual Striped Polo Shirt',
    description: 'Breathable cotton polo shirt with stylish horizontal stripes.',
    price: 24.99,
    slug: 'casual-striped-polo-shirt',
    gender: 'MEN',
    material: 'Cotton',
    brand: 'Cartify Basics',
    categoryName: 'Men\'s Fashion',
    variants: [
      { size: 'M', color: 'Navy/White', stock: 40, sku: 'PL-NW-M' },
      { size: 'L', color: 'Navy/White', stock: 35, sku: 'PL-NW-L' },
      { size: 'XL', color: 'Navy/White', stock: 20, sku: 'PL-NW-XL' },
    ],
    images: [
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'
    ]
  },
  {
    name: 'High-Waisted Yoga Leggings',
    description: 'Premium stretch leggings with high waistband for support during workouts or casual wear.',
    price: 29.99,
    slug: 'high-waisted-yoga-leggings',
    gender: 'WOMEN',
    material: 'Nylon Spandex',
    brand: 'ActiveFit',
    categoryName: 'Women\'s Fashion',
    variants: [
      { size: 'XS', color: 'Black', stock: 20, sku: 'YG-B-XS' },
      { size: 'S', color: 'Black', stock: 40, sku: 'YG-B-S' },
      { size: 'M', color: 'Black', stock: 45, sku: 'YG-B-M' },
      { size: 'L', color: 'Black', stock: 30, sku: 'YG-B-L' },
    ],
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80'
    ]
  }
];

async function main() {
  console.log('Starting test data setup...');

  // 1. Find unwanted products
  const unwantedCategories = ['Electronics', 'Mobile Phone'];
  const productsToDelete = await prisma.product.findMany({
    where: {
      category: {
        name: {
          in: unwantedCategories
        }
      }
    }
  });

  console.log(`Found ${productsToDelete.length} products to remove.`);

  let deletedCount = 0;
  for (const prod of productsToDelete) {
    try {
      // Check if there are orders
      const orderItems = await prisma.orderItem.count({ where: { productId: prod.id } });
      if (orderItems > 0) {
        // Soft delete
        await prisma.product.update({
          where: { id: prod.id },
          data: { isDeleted: true }
        });
        await prisma.productVariant.updateMany({
          where: { productId: prod.id },
          data: { isDeleted: true }
        });
        console.log(`Soft-deleted ${prod.name} due to existing orders.`);
      } else {
        // Hard delete relations safely
        await prisma.cartItem.deleteMany({ where: { productId: prod.id } });
        await prisma.wishlistItem.deleteMany({ where: { productId: prod.id } });
        await prisma.productImage.deleteMany({ where: { productId: prod.id } });
        await prisma.inventoryTransaction.deleteMany({ where: { productId: prod.id } });
        await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
        await prisma.review.deleteMany({ where: { productId: prod.id } });
        
        await prisma.product.delete({ where: { id: prod.id } });
        console.log(`Hard-deleted ${prod.name}.`);
      }
      deletedCount++;
    } catch (err: any) {
      console.error(`Failed to delete ${prod.name}:`, err.message);
    }
  }

  // 2. Ensure Categories Exist
  const categoryNames = [...new Set(productsToAdd.map(p => p.categoryName))];
  const categoryMap = new Map();

  for (const catName of categoryNames) {
    let cat = await prisma.category.findUnique({ where: { name: catName } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        }
      });
      console.log(`Created category: ${catName}`);
    }
    categoryMap.set(catName, cat.id);
  }

  // 3. Add new products
  let addedCount = 0;
  for (const productData of productsToAdd) {
    // Check if slug already exists
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (existing) {
      console.log(`Product ${productData.name} already exists. Skipping.`);
      continue;
    }

    const { categoryName, variants, images, gender, ...baseData } = productData;
    
    try {
      const newProduct = await prisma.product.create({
        data: {
          ...baseData,
          gender: gender as any,
          categoryId: categoryMap.get(categoryName),
          variants: {
            create: variants.map(v => ({
              size: v.size,
              color: v.color,
              sku: v.sku,
              stock: v.stock,
              price: baseData.price,
              compareAtPrice: baseData.price * 1.2 // Add a realistic discount for testing
            }))
          },
          images: {
            create: images.map((url, i) => ({
              url,
              sortOrder: i,
              isPrimary: i === 0,
              altText: `${baseData.name} image ${i + 1}`
            }))
          }
        }
      });
      console.log(`Added product: ${newProduct.name}`);
      addedCount++;
    } catch (err: any) {
      console.error(`Failed to add product ${productData.name}:`, err.message);
    }
  }

  console.log(`\nSetup complete!`);
  console.log(`Deleted: ${deletedCount}`);
  console.log(`Added: ${addedCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
