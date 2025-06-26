/*
  # Create Rep Record and Policies

  1. Creates a rep record for the test user
  2. Sets up RLS policies for:
    - Rep access to their own data
    - Brand access to rep info for their orders/samples
*/

-- Create rep record if it doesn't exist
INSERT INTO reps (
  name,
  email,
  active,
  created_at,
  updated_at
)
VALUES (
  'Test Rep',
  'rep1@maryadha.com',
  true,
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

-- Create policies for rep access
CREATE POLICY "reps_view_own_profile"
  ON reps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reps_update_own_data"
  ON reps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for brands to view limited rep info
CREATE POLICY "brands_view_order_reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT rep_id FROM orders WHERE brand_id = auth.uid()
  ));

CREATE POLICY "brands_view_sample_reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT rep_id FROM samples WHERE brand_id = auth.uid()
  ));