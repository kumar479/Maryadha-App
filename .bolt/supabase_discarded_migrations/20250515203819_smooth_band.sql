/*
  # Update factories schema with leather types and finishes

  1. Changes
    - Add leather_type enum (CowHide, LambSkin, GoatSkin)
    - Add tanning_type enum (Chrome, Vegetable)
    - Add finish_type enum (Distressed, Polished, Matte, Pebbled, Suede)
    - Update factories table with new array columns
    - Add GIN indexes for array searching
  
  2. Security
    - Maintain existing RLS policies
    - No data loss during migration
*/

-- Create new enum types if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leather_type') THEN
    CREATE TYPE leather_type AS ENUM ('CowHide', 'LambSkin', 'GoatSkin');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tanning_type') THEN
    CREATE TYPE tanning_type AS ENUM ('Chrome', 'Vegetable');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'finish_type') THEN
    CREATE TYPE finish_type AS ENUM ('Distressed', 'Polished', 'Matte', 'Pebbled', 'Suede');
  END IF;
END $$;

-- Update factories table
DO $$ 
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factories' AND column_name = 'leather_types') THEN
    ALTER TABLE factories ADD COLUMN leather_types leather_type[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factories' AND column_name = 'tanning_types') THEN
    ALTER TABLE factories ADD COLUMN tanning_types tanning_type[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factories' AND column_name = 'finishes') THEN
    ALTER TABLE factories ADD COLUMN finishes finish_type[] DEFAULT '{}';
  END IF;
END $$;

-- Create GIN indexes for array columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_factories_leather_types') THEN
    CREATE INDEX idx_factories_leather_types ON factories USING GIN (leather_types);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_factories_tanning_types') THEN
    CREATE INDEX idx_factories_tanning_types ON factories USING GIN (tanning_types);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_factories_finishes') THEN
    CREATE INDEX idx_factories_finishes ON factories USING GIN (finishes);
  END IF;
END $$;

-- Update existing data with default values
UPDATE factories
SET 
  leather_types = ARRAY['CowHide']::leather_type[],
  tanning_types = ARRAY['Chrome']::tanning_type[],
  finishes = ARRAY['Polished']::finish_type[]
WHERE leather_types IS NULL OR leather_types = '{}';