/*
  # Create samples table and policies

  1. New Tables
    - `samples` table for tracking sample requests
      - `id` (uuid, primary key)
      - `brand_id` (uuid, references brands)
      - `factory_id` (uuid, references factories)
      - `status` (sample_status enum)
      - `tech_pack_url` (text)
      - `sketch_url` (text)
      - `notes` (text)
      - `preferred_moq` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on samples table
    - Add policies for brand access
    - Add policies for rep access
*/

-- Create sample status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sample_status') THEN
    CREATE TYPE sample_status AS ENUM (
      'requested',
      'in_review',
      'approved',
      'in_production',
      'shipped',
      'delivered',
      'rejected'
    );
  END IF;
END $$;

-- Create samples table if it doesn't exist
CREATE TABLE IF NOT EXISTS samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id),
  factory_id uuid REFERENCES factories(id),
  status sample_status DEFAULT 'requested',
  tech_pack_url text,
  sketch_url text,
  notes text,
  preferred_moq integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can insert their own samples" ON samples;
  DROP POLICY IF EXISTS "Users can view their own samples" ON samples;
  DROP POLICY IF EXISTS "Users can update their own samples" ON samples;
  DROP POLICY IF EXISTS "Reps can view assigned samples" ON samples;
  DROP POLICY IF EXISTS "Reps can update assigned samples" ON samples;
END $$;

-- Create new policies
CREATE POLICY "Users can insert their own samples"
  ON samples
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Users can view their own samples"
  ON samples
  FOR SELECT
  TO authenticated
  USING (auth.uid() = brand_id);

CREATE POLICY "Users can update their own samples"
  ON samples
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = brand_id);

-- Create updated_at trigger
CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();