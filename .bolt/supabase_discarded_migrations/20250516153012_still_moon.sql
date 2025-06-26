/*
  # Seed factory data

  This migration inserts initial data into the factories table.
  It includes basic information about leather manufacturers.

  1. Data Added
    - Three initial factories with their details
    - Each factory includes:
      - Basic info (name, location, description)
      - Manufacturing capabilities (leather types, tanning types, finishes)
      - Business details (MOQ, certifications)

  2. Updates
    - Uses ON CONFLICT to update existing records
    - Preserves data integrity with proper type casting
*/

INSERT INTO factories (
  name,
  location,
  description,
  verified,
  minimum_order_quantity,
  leather_types,
  tanning_types,
  finishes,
  certifications
) VALUES
(
  'Khader Leathers',
  'Chennai, India',
  'Founded in 1978, Khader Leathers has been a pioneer in sustainable leather manufacturing. Our family-owned atelier specializes in small batch, high-quality leather goods with a focus on environmental responsibility and artisan craftsmanship. We use traditional tanning methods passed down through generations, combined with modern techniques for durability and consistency.',
  true,
  30,
  ARRAY['CowHide', 'LambSkin']::leather_type[],
  ARRAY['Vegetable']::tanning_type[],
  ARRAY['Distressed', 'Polished', 'Matte']::finish_type[],
  ARRAY['ISO 9001', 'LWG Gold']
),
(
  'Arora Fine Leathers',
  'Delhi, India',
  'Arora Fine Leathers brings three decades of expertise to luxury leather crafting. Our studio specializes in premium quality leather for fashion accessories, with a particular expertise in exotic finishes and embossing techniques. We''ve been trusted partners for international luxury brands who value our attention to detail and consistency.',
  true,
  50,
  ARRAY['LambSkin', 'GoatSkin']::leather_type[],
  ARRAY['Chrome', 'Vegetable']::tanning_type[],
  ARRAY['Pebbled', 'Suede', 'Polished']::finish_type[],
  ARRAY['ISO 9001', 'ISO 14001']
),
(
  'Mehta Leather Works',
  'Kolkata, India',
  'Specializing in minimalist, contemporary leather goods, Mehta Leather Works has built a reputation for precision and quality since 2005. Our workshop creates leather pieces with clean lines and perfect stitching, appealing to modern, design-focused brands. We balance traditional craftsmanship with innovative techniques to create leather goods that are both timeless and contemporary.',
  true,
  25,
  ARRAY['CowHide', 'GoatSkin']::leather_type[],
  ARRAY['Chrome']::tanning_type[],
  ARRAY['Matte', 'Polished', 'Suede']::finish_type[],
  ARRAY['ISO 9001']
)
ON CONFLICT (name) DO UPDATE SET
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  minimum_order_quantity = EXCLUDED.minimum_order_quantity,
  leather_types = EXCLUDED.leather_types,
  tanning_types = EXCLUDED.tanning_types,
  finishes = EXCLUDED.finishes,
  certifications = EXCLUDED.certifications;