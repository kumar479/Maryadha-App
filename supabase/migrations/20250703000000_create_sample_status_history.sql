/*
  # Create sample_status_history table

  This migration adds the `sample_status_history` table used to track
  status updates for sample requests, including ETA and tracking information.
*/

-- Create sample_status_history table
CREATE TABLE IF NOT EXISTS public.sample_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid NOT NULL,
  status text NOT NULL,
  notes text,
  eta date,
  tracking_number text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.sample_status_history
  ADD CONSTRAINT sample_status_history_sample_id_fkey 
  FOREIGN KEY (sample_id) REFERENCES public.samples(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sample_status_history_sample_id 
  ON public.sample_status_history(sample_id);

CREATE INDEX IF NOT EXISTS idx_sample_status_history_created_at 
  ON public.sample_status_history(created_at);

-- Enable RLS
ALTER TABLE public.sample_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for sample_status_history
CREATE POLICY "Users can view sample status history for their samples"
  ON public.sample_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.samples 
      WHERE samples.id = sample_status_history.sample_id 
      AND samples.brand_id = auth.uid()
    )
  );

CREATE POLICY "Reps can view sample status history for assigned samples"
  ON public.sample_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.samples 
      WHERE samples.id = sample_status_history.sample_id 
      AND samples.rep_id = auth.uid()
    )
  );

CREATE POLICY "Reps can insert sample status history for assigned samples"
  ON public.sample_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.samples 
      WHERE samples.id = sample_status_history.sample_id 
      AND samples.rep_id = auth.uid()
    )
  );

CREATE POLICY "Reps can update sample status history for assigned samples"
  ON public.sample_status_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.samples 
      WHERE samples.id = sample_status_history.sample_id 
      AND samples.rep_id = auth.uid()
    )
  ); 