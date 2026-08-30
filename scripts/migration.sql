-- Insert a default variant for each product
INSERT INTO "product_variants" ("id", "product_id", "size", "color", "sku", "price", "stock", "is_deleted", "created_at", "updated_at")
SELECT 
  gen_random_uuid()::text, 
  id, 
  'Free Size', 
  'Default', 
  UPPER(SUBSTRING(id, 1, 8)) || '-DEFAULT', 
  price, 
  stock, 
  is_deleted, 
  created_at, 
  updated_at
FROM "products"
WHERE NOT EXISTS (SELECT 1 FROM "product_variants" WHERE product_id = "products".id);

-- Update cart items
UPDATE "cart_items"
SET "variant_id" = (
  SELECT "id" FROM "product_variants" WHERE "product_id" = "cart_items"."product_id" LIMIT 1
)
WHERE "variant_id" IS NULL;

-- Update order items
UPDATE "order_items"
SET 
  "variant_id" = (
    SELECT "id" FROM "product_variants" WHERE "product_id" = "order_items"."product_id" LIMIT 1
  ),
  "variant_size" = 'Free Size',
  "variant_color" = 'Default',
  "variant_sku" = (
    SELECT "sku" FROM "product_variants" WHERE "product_id" = "order_items"."product_id" LIMIT 1
  )
WHERE "variant_id" IS NULL;

-- Update inventory transactions
UPDATE "inventory_transactions"
SET "variant_id" = (
  SELECT "id" FROM "product_variants" WHERE "product_id" = "inventory_transactions"."product_id" LIMIT 1
)
WHERE "variant_id" IS NULL;

-- Move images
INSERT INTO "product_images" ("id", "product_id", "url", "is_primary", "created_at", "updated_at", "sort_order")
SELECT 
  gen_random_uuid()::text, 
  id, 
  image, 
  true, 
  created_at, 
  updated_at,
  0
FROM "products"
WHERE "image" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "product_images" WHERE product_id = "products".id);
