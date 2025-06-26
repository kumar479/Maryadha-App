/*
  # Create samples table

  This migration adds the `samples` table used to track sample requests.
  It also ensures the supporting enum and trigger function exist.
*/

-- Ensure sample_status enum exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sample_status') THEN
    CREATE TYPE public.sample_status AS ENUM (
      'requested',
      'shipped',
      'in_review',
      'approved',
      'rejected',
      'invoice_sent'
    );
  END IF;
END;
$$;

-- Create or replace trigger helper for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create samples table
CREATE TABLE IF NOT EXISTS public.samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid,
  status text,
  file_url text,
  comments text,
  rep_id uuid,
  factory_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Status check constraint
ALTER TABLE public.samples DROP CONSTRAINT IF EXISTS samples_status_check;
ALTER TABLE public.samples
  ADD CONSTRAINT samples_status_check
  CHECK (status IN ('requested','shipped','in_review','approved','in_production','delivered','rejected','invoice_sent'));

-- Foreign keys
ALTER TABLE public.samples DROP CONSTRAINT IF EXISTS samples_brand_id_fkey;
ALTER TABLE public.samples
  ADD CONSTRAINT samples_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
ALTER TABLE public.samples DROP CONSTRAINT IF EXISTS samples_factory_id_fkey;
ALTER TABLE public.samples
  ADD CONSTRAINT samples_factory_id_fkey FOREIGN KEY (factory_id) REFERENCES public.factories(id);
ALTER TABLE public.samples DROP CONSTRAINT IF EXISTS samples_rep_id_fkey;
ALTER TABLE public.samples
  ADD CONSTRAINT samples_rep_id_fkey FOREIGN KEY (rep_id) REFERENCES public.reps(id);

-- Enable RLS
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own samples" ON public.samples;
CREATE POLICY "Users can insert their own samples" ON public.samples
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = brand_id);

DROP POLICY IF EXISTS "Users can view their own samples" ON public.samples;
CREATE POLICY "Users can view their own samples" ON public.samples
  FOR SELECT TO authenticated
  USING (auth.uid() = brand_id);

DROP POLICY IF EXISTS "Users can update their own samples" ON public.samples;
CREATE POLICY "Users can update their own samples" ON public.samples
  FOR UPDATE TO authenticated
  USING (auth.uid() = brand_id);

DROP POLICY IF EXISTS "Reps can view assigned samples" ON public.samples;
CREATE POLICY "Reps can view assigned samples" ON public.samples
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT reps.user_id FROM public.reps WHERE reps.id = rep_id));

DROP POLICY IF EXISTS "Reps can update assigned samples" ON public.samples;
CREATE POLICY "Reps can update assigned samples" ON public.samples
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT reps.user_id FROM public.reps WHERE reps.id = rep_id));

-- Trigger to keep updated_at current
DROP TRIGGER IF EXISTS update_samples_updated_at ON public.samples;
CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON public.samples
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
DROP INDEX IF EXISTS idx_samples_brand_id;
CREATE INDEX idx_samples_brand_id ON public.samples (brand_id);
DROP INDEX IF EXISTS idx_samples_factory_id;
CREATE INDEX idx_samples_factory_id ON public.samples (factory_id);
DROP INDEX IF EXISTS idx_samples_rep_id;
CREATE INDEX idx_samples_rep_id ON public.samples (rep_id);

-- Grant privileges
GRANT ALL ON TABLE public.samples TO anon;
GRANT ALL ON TABLE public.samples TO authenticated;
GRANT ALL ON TABLE public.samples TO service_role;
