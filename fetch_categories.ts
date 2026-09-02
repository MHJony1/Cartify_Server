import { prisma } from './src/app/lib/prisma';

async function main() {
  const categories = await prisma.category.findMany();
  console.log("Categories:", categories.map((c: any) => c.name));

  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
      images: true,
    }
  });

  console.log(`\nFound ${products.length} products.`);
  
  for (const product of products) {
    console.log(`- ${product.name} [${product.category.name}]`);
    console.log(`  Variants: ${product.variants.length}, Images: ${product.images.length}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
