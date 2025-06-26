/*
  # Create factories table
  
  Creates the factories table with all necessary columns for storing manufacturer information.
  
  1. Table Structure
    - Basic info: id, name, location, description, verified status
    - Media: image_url, video_url, gallery_urls, social links
    - Manufacturing details: moq, leather types, tanning types, finishes
    - Timestamps and certifications
*/

-- Create type enums if they don't exist
DO $$ BEGIN
  CREATE TYPE leather_type AS ENUM ('CowHide', 'GoatSkin', 'LambSkin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tanning_type AS ENUM ('Chrome', 'Vegetable');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE finish_type AS ENUM ('Distressed', 'Matte', 'Pebbled', 'Polished', 'Suede');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create factories table
CREATE TABLE IF NOT EXISTS factories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  description text,
  verified boolean DEFAULT false,
  image_url text,
  video_url text,
  instagram text,
  website text,
  gallery_urls text[],
  moq integer NOT NULL,
  leather_types leather_type[] DEFAULT '{}',
  tanning_types tanning_type[] DEFAULT '{}',
  finishes finish_type[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_factories_updated_at
  BEFORE UPDATE ON factories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO factories (
  name, location, description, verified, image_url, video_url, instagram, website,
  gallery_urls, moq, leather_types, tanning_types, finishes, certifications
) VALUES 
  (
    'Khader Leathers',
    'Chennai, India',
    'Founded in 1978, Khader Leathers has been a pioneer in sustainable leather manufacturing. Our family-owned atelier specializes in small batch, high-quality leather goods with a focus on environmental responsibility and artisan craftsmanship. We use traditional tanning methods passed down through generations, combined with modern techniques for durability and consistency.',
    true,
    'https://images.pexels.com/photos/5755160/pexels-photo-5755160.jpeg',
    'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=164&oauth2_token_id=57447761',
    '@khaderleathers',
    'https://khaderleathers.com',
    ARRAY[
      'https://images.pexels.com/photos/6845083/pexels-photo-6845083.jpeg',
      'https://images.pexels.com/photos/6822748/pexels-photo-6822748.jpeg',
      'https://images.pexels.com/photos/6843764/pexels-photo-6843764.jpeg',
      'https://images.pexels.com/photos/6843534/pexels-photo-6843534.jpeg'
    ],
    30,
    ARRAY['CowHide', 'LambSkin']::leather_type[],
    ARRAY['Vegetable']::tanning_type[],
    ARRAY['Distressed', 'Polished', 'Matte']::finish_type[],
    ARRAY['ISO 9001', 'LWG Gold']
  );