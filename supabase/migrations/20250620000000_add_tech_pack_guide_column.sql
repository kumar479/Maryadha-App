-- Add tech pack guide column for factories
ALTER TABLE public.factories
  ADD COLUMN IF NOT EXISTS tech_pack_guide text;
