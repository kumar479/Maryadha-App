-- Add additional fields for factory profile pages
ALTER TABLE public.factories
  ADD COLUMN IF NOT EXISTS founder_story text,
  ADD COLUMN IF NOT EXISTS delivery_timeline text,
  ADD COLUMN IF NOT EXISTS certifications text[],
  ADD COLUMN IF NOT EXISTS branding_assets text[];
