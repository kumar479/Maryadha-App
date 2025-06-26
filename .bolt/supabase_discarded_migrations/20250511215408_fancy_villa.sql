/*
  # Fix nullable text fields for brand user

  1. Updates
    - Sets empty string values for all nullable text fields in the brand user's row
    - Updates JSON metadata fields to empty objects if NULL
  
  2. Constraints
    - Adds NOT NULL constraints with appropriate default values
    - Ensures consistent data structure for auth user fields

  Note: This migration is idempotent and can be safely run multiple times
*/

-- First update the specific brand user's NULL values to empty strings
UPDATE auth.users
SET 
  email_change = COALESCE(email_change, ''),
  phone = COALESCE(phone, ''),
  phone_change = COALESCE(phone_change, ''),
  email_confirm_token = COALESCE(email_confirm_token, ''),
  phone_confirm_token = COALESCE(phone_confirm_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  confirmation_token = COALESCE(confirmation_token, ''),
  invited_email = COALESCE(invited_email, ''),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{"role": "brand"}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
WHERE id = '44444444-4444-4444-4444-444444444444';

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
      
      ALTER COLUMN email_confirm_token SET DEFAULT '',
      ALTER COLUMN email_confirm_token SET NOT NULL,
      
      ALTER COLUMN phone_confirm_token SET DEFAULT '',
      ALTER COLUMN phone_confirm_token SET NOT NULL,
      
      ALTER COLUMN reauthentication_token SET DEFAULT '',
      ALTER COLUMN reauthentication_token SET NOT NULL,
      
      ALTER COLUMN recovery_token SET DEFAULT '',
      ALTER COLUMN recovery_token SET NOT NULL,
      
      ALTER COLUMN confirmation_token SET DEFAULT '',
      ALTER COLUMN confirmation_token SET NOT NULL,
      
      ALTER COLUMN invited_email SET DEFAULT '',
      ALTER COLUMN invited_email SET NOT NULL,
      
      ALTER COLUMN raw_app_meta_data SET DEFAULT '{}'::jsonb,
      ALTER COLUMN raw_app_meta_data SET NOT NULL,
      
      ALTER COLUMN raw_user_meta_data SET DEFAULT '{}'::jsonb,
      ALTER COLUMN raw_user_meta_data SET NOT NULL;
  END IF;
END $$;