-- Add fields for product name and reference images
ALTER TABLE public.samples
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS reference_images text[];
