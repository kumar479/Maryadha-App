-- Add rep_id column to factories table to establish factory-rep relationship
ALTER TABLE public.factories 
ADD COLUMN IF NOT EXISTS rep_id uuid REFERENCES public.reps(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_factories_rep_id ON public.factories (rep_id);

-- Add RLS policy for reps to view their assigned factories
DROP POLICY IF EXISTS "Reps can view their assigned factories" ON public.factories;
CREATE POLICY "Reps can view their assigned factories"
  ON public.factories FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT reps.user_id FROM public.reps WHERE reps.id = rep_id));

-- Add RLS policy for reps to update their assigned factories
DROP POLICY IF EXISTS "Reps can update their assigned factories" ON public.factories;
CREATE POLICY "Reps can update their assigned factories"
  ON public.factories FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT reps.user_id FROM public.reps WHERE reps.id = rep_id)); 