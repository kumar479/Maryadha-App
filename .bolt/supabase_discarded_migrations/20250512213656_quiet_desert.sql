/*
  # Add created_at column to samples table

  1. Changes
    - Add created_at column to samples table with default value and timestamp type
    - Add updated_at column to samples table with default value and timestamp type
    - Add trigger to automatically update updated_at column
*/

-- Add created_at column
ALTER TABLE samples 
ADD COLUMN created_at timestamptz DEFAULT now();

-- Add updated_at column
ALTER TABLE samples 
ADD COLUMN updated_at timestamptz DEFAULT now();

-- Create trigger for updating updated_at
CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();