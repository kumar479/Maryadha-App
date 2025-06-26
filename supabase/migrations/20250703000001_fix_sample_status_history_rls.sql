-- Fix RLS for sample_status_history to allow reps by user_id
DROP POLICY IF EXISTS "Reps can insert sample status history for assigned samples" ON public.sample_status_history;
DROP POLICY IF EXISTS "Reps can view sample status history for assigned samples" ON public.sample_status_history;

CREATE POLICY "Reps can insert sample status history for assigned samples"
  ON public.sample_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.samples s
      JOIN public.reps r ON s.rep_id = r.id
      WHERE s.id = sample_status_history.sample_id
      AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Reps can view sample status history for assigned samples"
  ON public.sample_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.samples s
      JOIN public.reps r ON s.rep_id = r.id
      WHERE s.id = sample_status_history.sample_id
      AND r.user_id = auth.uid()
    )
  ); 