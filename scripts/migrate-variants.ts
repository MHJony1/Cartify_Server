import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration...");

  // 1. Fetch all products
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      images: true,
    }
  });

  for (const product of products) {
    console.log(`Processing product: ${product.name} (${product.id})`);

    // Create a default variant if none exists
    let defaultVariant = product.variants[0];

    if (!defaultVariant) {
      // Create default variant
      defaultVariant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: "Free Size",
          color: "Default",
          sku: `${product.id.substring(0, 8).toUpperCase()}-DEFAULT`,
          price: product.price,
          // We use queryRaw because stock is temporarily back on product schema
        }
      });
      // Set stock via raw SQL since it's on product but we want to copy it
      await prisma.$executeRawUnsafe(`UPDATE product_variants SET stock = (SELECT stock FROM products WHERE id = $1) WHERE id = $2`, product.id, defaultVariant.id);
      
      console.log(`  Created default variant: ${defaultVariant.id}`);
    }

    // Move image if exists
    // We use queryRaw to get the image because we added it back to schema temporarily
    const p: any = await prisma.$queryRawUnsafe(`SELECT image FROM products WHERE id = $1`, product.id);
    if (p && p.length > 0 && p[0].image && product.images.length === 0) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p[0].image,
          isPrimary: true,
        }
      });
      console.log(`  Moved image to ProductImage.`);
    }

    // 2. Update CartItems
    const cartItemsUpdated = await prisma.$executeRawUnsafe(`
      UPDATE cart_items SET variant_id = $1 WHERE product_id = $2 AND variant_id IS NULL
    `, defaultVariant.id, product.id);
    if (cartItemsUpdated > 0) console.log(`  Updated ${cartItemsUpdated} cart items.`);

    // 3. Update OrderItems
    const orderItemsUpdated = await prisma.$executeRawUnsafe(`
      UPDATE order_items 
      SET variant_id = $1, variant_size = 'Free Size', variant_color = 'Default', variant_sku = $2 
      WHERE product_id = $3 AND variant_id IS NULL
    `, defaultVariant.id, defaultVariant.sku, product.id);
    if (orderItemsUpdated > 0) console.log(`  Updated ${orderItemsUpdated} order items.`);

    // 4. Update InventoryTransactions
    const inventoryUpdated = await prisma.$executeRawUnsafe(`
      UPDATE inventory_transactions SET variant_id = $1 WHERE product_id = $2 AND variant_id IS NULL
    `, defaultVariant.id, product.id);
    if (inventoryUpdated > 0) console.log(`  Updated ${inventoryUpdated} inventory transactions.`);
  }

  console.log("Data migration completed successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
