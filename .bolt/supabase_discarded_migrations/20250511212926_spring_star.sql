/*
  # Enable RLS and Add Policies for Reps Table

  1. Changes
    - Enables Row Level Security on reps table
    - Grants SELECT to authenticated role
    - Creates policies for accessing rep data

  2. Security
    - Ensures reps can only be viewed by:
      a) The rep themselves (via user_id match)
      b) Brands who have orders/samples with the rep
      c) Other reps (for collaboration)
    - Adds policy for reps to update their own data
*/

-- Enable RLS on reps table if not already enabled
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

-- Grant SELECT to authenticated users
GRANT SELECT ON reps TO authenticated;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own reps" ON reps;
DROP POLICY IF EXISTS "Reps can read their own profile" ON reps;
DROP POLICY IF EXISTS "brands_view_assigned_reps" ON reps;
DROP POLICY IF EXISTS "reps_update_own_data" ON reps;

-- Create policy for reps to view their own profile
CREATE POLICY "reps_view_own_profile"
  ON reps
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'role')::text = 'rep'
    )
  );

-- Create policy for brands to view their assigned reps
CREATE POLICY "brands_view_assigned_reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.rep_id = reps.id
      AND orders.brand_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM samples
      WHERE samples.rep_id = reps.id
      AND samples.brand_id = auth.uid()
    )
  );

-- Create policy for reps to update their own data
CREATE POLICY "reps_update_own_data"
  ON reps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);