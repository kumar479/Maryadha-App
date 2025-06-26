/*
  # Clean brand users and set NOT NULL constraints

  1. Changes
    - Updates NULL values to empty strings for brand users
    - Sets NOT NULL constraints with default values
    - Handles the changes in a safe, idempotent way

  2. Safety Measures
    - Uses DO blocks to check column existence
    - Updates data before altering constraints
    - Only affects auth.users table
*/

-- First update any existing NULL values to empty strings for brand users
UPDATE auth.users
SET 
  email_change = COALESCE(email_change, ''),
  phone = COALESCE(phone, ''),
  phone_change = COALESCE(phone_change, ''),
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{"role": "brand"}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
WHERE raw_app_meta_data->>'role' = 'brand';

-- Now alter the columns to set defaults and NOT NULL constraints
DO $$ 
BEGIN
  -- Only alter columns if they are nullable
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'email_change' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE auth.users
      ALTER COLUMN email_change SET DEFAULT '',
      ALTER COLUMN email_change SET NOT NULL,
      
      ALTER COLUMN phone SET DEFAULT '',
      ALTER COLUMN phone SET NOT NULL,
      
      ALTER COLUMN phone_change SET DEFAULT '',
      ALTER COLUMN phone_change SET NOT NULL,
      
      ALTER COLUMN confirmation_token SET DEFAULT '',
      ALTER COLUMN confirmation_token SET NOT NULL,
      
      ALTER COLUMN recovery_token SET DEFAULT '',
      ALTER COLUMN recovery_token SET NOT NULL,
      
      ALTER COLUMN reauthentication_token SET DEFAULT '',
      ALTER COLUMN reauthentication_token SET NOT NULL,
      
      ALTER COLUMN raw_app_meta_data SET DEFAULT '{}'::jsonb,
      ALTER COLUMN raw_app_meta_data SET NOT NULL,
      
      ALTER COLUMN raw_user_meta_data SET DEFAULT '{}'::jsonb,
      ALTER COLUMN raw_user_meta_data SET NOT NULL;
  END IF;
END $$;