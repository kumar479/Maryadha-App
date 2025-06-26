-- Add fields for quantity, finish notes, and delivery address to samples table
ALTER TABLE public.samples
  ADD COLUMN quantity integer,
  ADD COLUMN finish_notes text,
  ADD COLUMN delivery_address text;
