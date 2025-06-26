/*
  # Fix auth.users table constraints

  1. Updates
    - Set empty string defaults for NULL values in auth.users table
    - Add NOT NULL constraints to prevent future NULL values
    
  2. Changes
    - Updates all NULL values to empty strings for specific columns
    - Adds default values and NOT NULL constraints
    
  3. Security
    - Only affects auth.users table
    - Maintains data integrity
*/

-- First update any existing NULL values to empty strings
UPDATE auth.users
SET 
  phone = COALESCE(phone, ''),
  phone_change = COALESCE(phone_change, ''),
  email_change = COALESCE(email_change, ''),
  recovery_token = COALESCE(recovery_token, ''),
  confirmation_token = COALESCE(confirmation_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb);

-- Now alter the columns to set defaults and NOT NULL constraints
DO $$ 
BEGIN
  -- Only alter columns if they are nullable
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'phone' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE auth.users
      ALTER COLUMN phone SET DEFAULT '',
      ALTER COLUMN phone SET NOT NULL,
      
      ALTER COLUMN phone_change SET DEFAULT '',
      ALTER COLUMN phone_change SET NOT NULL,
      
      ALTER COLUMN email_change SET DEFAULT '',
      ALTER COLUMN email_change SET NOT NULL,
      
      ALTER COLUMN recovery_token SET DEFAULT '',
      ALTER COLUMN recovery_token SET NOT NULL,
      
      ALTER COLUMN confirmation_token SET DEFAULT '',
      ALTER COLUMN confirmation_token SET NOT NULL,
      
      ALTER COLUMN reauthentication_token SET DEFAULT '',
      ALTER COLUMN reauthentication_token SET NOT NULL,
      
      ALTER COLUMN raw_app_meta_data SET DEFAULT '{}'::jsonb,
      ALTER COLUMN raw_app_meta_data SET NOT NULL,
      
      ALTER COLUMN raw_user_meta_data SET DEFAULT '{}'::jsonb,
      ALTER COLUMN raw_user_meta_data SET NOT NULL;
  END IF;
END $$;