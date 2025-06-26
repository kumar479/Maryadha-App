/*
  # Enable RLS and Add Policies for Reps Table

  1. Changes
    - Enables Row Level Security on the reps table
    - Creates a policy allowing users to read their own rep data
    - Creates a policy allowing reps to read their own profile

  2. Security
    - Ensures users can only access rep data associated with their user ID
    - Allows reps to view their own profile information
    - Restricts access based on authentication and user roles
*/

-- Enable RLS on reps table
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own rep data
CREATE POLICY "Users can read their own reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for reps to read their own profile
CREATE POLICY "Reps can read their own profile"
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