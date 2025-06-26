/*
  # Create Rep Record

  1. Changes
    - Create rep record for existing auth user
    - Add RLS policies for rep access

  2. Security
    - Enable RLS on reps table
    - Add policies for rep data access
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

-- Enable RLS if not already enabled
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

-- Create policies for rep access
CREATE POLICY IF NOT EXISTS "Reps can view their own profile"
  ON reps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Reps can update their own data"
  ON reps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for brands to view limited rep info
CREATE POLICY IF NOT EXISTS "Brands can view limited rep info for their orders"
  ON reps
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT rep_id FROM orders WHERE brand_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Brands can view limited rep info for their samples"
  ON reps
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT rep_id FROM samples WHERE brand_id = auth.uid()
  ));