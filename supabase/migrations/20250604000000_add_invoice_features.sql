/*
  # Add invoice support and sample_paid status
  - Adds invoice_url and payment_client_secret columns to samples
  - Adds due_date column to sample_payments
  - Extends sample_status enum with sample_paid
*/

ALTER TABLE public.samples ADD COLUMN IF NOT EXISTS invoice_url text;
ALTER TABLE public.samples ADD COLUMN IF NOT EXISTS payment_client_secret text;

ALTER TABLE public.sample_payments ADD COLUMN IF NOT EXISTS due_date date;

ALTER TYPE public.sample_status ADD VALUE IF NOT EXISTS 'sample_paid';

ALTER TABLE public.samples DROP CONSTRAINT IF EXISTS samples_status_check;
ALTER TABLE public.samples
  ADD CONSTRAINT samples_status_check
    CHECK (status IN ('requested','shipped','in_review','approved','in_production','delivered','rejected','invoice_sent','sample_paid'));
