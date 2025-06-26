/*
  # Update factories table with new leather types and tanning processes

  1. Changes
    - Add leather_types as enum type
    - Add tanning_types as enum type
    - Add finishes as enum type
    - Update factories table columns

  2. Data Migration
    - Convert existing data to new enum types
*/

-- Create new enum types
CREATE TYPE leather_type AS ENUM ('CowHide', 'LambSkin', 'GoatSkin');
CREATE TYPE tanning_type AS ENUM ('Chrome', 'Vegetable');
CREATE TYPE finish_type AS ENUM ('Distressed', 'Polished', 'Matte', 'Pebbled', 'Suede');

-- Update factories table
ALTER TABLE factories
  -- Drop old columns if they exist
  DROP COLUMN IF EXISTS tags,
  -- Add new columns
  ADD COLUMN IF NOT EXISTS leather_types leather_type[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tanning_types tanning_type[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS finishes finish_type[] DEFAULT '{}';

-- Create indexes for array columns
CREATE INDEX IF NOT EXISTS idx_factories_leather_types ON factories USING GIN (leather_types);
CREATE INDEX IF NOT EXISTS idx_factories_tanning_types ON factories USING GIN (tanning_types);
CREATE INDEX IF NOT EXISTS idx_factories_finishes ON factories USING GIN (finishes);

-- Update existing data
UPDATE factories
SET 
  leather_types = ARRAY['CowHide']::leather_type[],
  tanning_types = ARRAY['Chrome']::tanning_type[],
  finishes = ARRAY['Polished']::finish_type[]
WHERE leather_types IS NULL;