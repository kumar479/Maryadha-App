-- Grant SELECT to authenticated users
GRANT SELECT ON public.brands TO authenticated;

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read their own brands" ON public.brands;

-- Create new SELECT policy
CREATE POLICY "Users can read their own brands"
  ON public.brands
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());