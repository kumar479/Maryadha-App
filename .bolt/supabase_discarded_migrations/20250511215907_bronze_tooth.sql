/*
  # Add RLS policy for brands table
  
  1. Security Changes
    - Enable RLS on brands table
    - Add policy for authenticated users to read their own brand data
*/

-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own brand data
CREATE POLICY "Users can read their own brands"
  ON brands
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);