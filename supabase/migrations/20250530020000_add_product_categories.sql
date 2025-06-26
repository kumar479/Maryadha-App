-- Add enum type for product categories
DO $$ BEGIN
    CREATE TYPE "public"."product_category" AS ENUM (
        'Bags',
        'Jackets',
        'Wallets',
        'Belts'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add product_categories column to factories table
ALTER TABLE IF EXISTS public.factories
    ADD COLUMN IF NOT EXISTS product_categories public.product_category[] DEFAULT ARRAY[]::public.product_category[];

-- Create index for faster search
CREATE INDEX IF NOT EXISTS idx_factories_product_categories ON public.factories USING GIN (product_categories);
