-- Add INSERT policy for factories table to allow reps to create factories
DROP POLICY IF EXISTS "Reps can insert factories" ON public.factories;
CREATE POLICY "Reps can insert factories"
  ON public.factories FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT reps.user_id 
      FROM public.reps 
      WHERE reps.id = rep_id
    )
  );

-- Add INSERT policy for factories table to allow service role to create factories (for admin operations)
DROP POLICY IF EXISTS "Service role can insert factories" ON public.factories;
CREATE POLICY "Service role can insert factories"
  ON public.factories FOR INSERT
  TO service_role
  WITH CHECK (true); 