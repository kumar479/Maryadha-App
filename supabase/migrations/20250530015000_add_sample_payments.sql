/*
  # Add sample payments and invoice_sent status

  1. Creates `sample_payments` table
     - `id` uuid primary key
     - `sample_id` uuid references samples(id)
     - `payment_type` text CHECK ('deposit','final')
     - `amount` numeric(10,2) NOT NULL
     - `stripe_payment_intent_id` text
     - `status` payment_status DEFAULT 'pending'
     - timestamps
  2. Extends `sample_status` enum with `invoice_sent`
  3. Adds policies mirroring order_payments for brands and reps
*/

-- Ensure payment_status enum exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'payment_status'
  ) THEN
    CREATE TYPE public.payment_status AS ENUM ('pending','partial','paid');
  END IF;
END;
$$;

-- Create sample_payments table
CREATE TABLE IF NOT EXISTS public.sample_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid,
  payment_type text NOT NULL,
  amount numeric(10,2) NOT NULL,
  stripe_payment_intent_id text,
  status public.payment_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT sample_payments_payment_type_check CHECK (payment_type IN ('deposit','final'))
);

-- Foreign keys
ALTER TABLE ONLY public.sample_payments
  ADD CONSTRAINT sample_payments_sample_id_fkey FOREIGN KEY (sample_id) REFERENCES public.samples(id);
ALTER TABLE ONLY public.sample_payments
  ADD CONSTRAINT sample_payments_stripe_payment_intent_id_fkey FOREIGN KEY (stripe_payment_intent_id) REFERENCES public.stripe_payment_intents(stripe_payment_intent_id);

-- Enable RLS
ALTER TABLE public.sample_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Brands can view their sample payments" ON public.sample_payments
  FOR SELECT TO authenticated
  USING (sample_id IN (
    SELECT samples.id FROM public.samples WHERE samples.brand_id = auth.uid()
  ));

CREATE POLICY "Reps can view assigned sample payments" ON public.sample_payments
  FOR SELECT TO authenticated
  USING (sample_id IN (
    SELECT samples.id FROM public.samples WHERE samples.rep_id IN (
      SELECT reps.id FROM public.reps WHERE reps.user_id = auth.uid()
    )
  ));

-- Extend enum
ALTER TYPE public.sample_status ADD VALUE IF NOT EXISTS 'invoice_sent';

-- Update check constraint on samples.status
ALTER TABLE public.samples DROP CONSTRAINT IF EXISTS samples_status_check;
ALTER TABLE public.samples ADD CONSTRAINT samples_status_check
  CHECK (status IN ('requested','shipped','in_review','approved','in_production','delivered','rejected','invoice_sent'));

-- Grant privileges
GRANT ALL ON TABLE public.sample_payments TO anon;
GRANT ALL ON TABLE public.sample_payments TO authenticated;
GRANT ALL ON TABLE public.sample_payments TO service_role;
