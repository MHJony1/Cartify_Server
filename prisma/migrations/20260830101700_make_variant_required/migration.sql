-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_variant_id_fkey";

-- DropIndex
DROP INDEX "cart_items_user_id_product_id_key";

-- DropIndex
DROP INDEX "order_items_order_id_product_id_key";

-- AlterTable
ALTER TABLE "cart_items" ALTER COLUMN "variant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "inventory_transactions" ALTER COLUMN "variant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "variant_color" SET NOT NULL,
ALTER COLUMN "variant_id" SET NOT NULL,
ALTER COLUMN "variant_size" SET NOT NULL,
ALTER COLUMN "variant_sku" SET NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "image",
DROP COLUMN "stock";

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_user_id_product_id_variant_id_key" ON "cart_items"("user_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_product_id_variant_id_key" ON "order_items"("order_id", "product_id", "variant_id");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
