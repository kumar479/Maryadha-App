/*
  # Clean up auth.users table

  1. Updates
    - Set default values for NULL fields in auth.users table
    - Add NOT NULL constraints to required fields
    
  2. Changes
    - Updates existing NULL values to empty strings/defaults
    - Adds NOT NULL constraints to prevent future NULL values
    - Sets appropriate default values for all columns
*/

-- First update any existing NULL values to empty strings
UPDATE auth.users
SET 
  aud = COALESCE(aud, ''),
  role = COALESCE(role, ''),
  email = COALESCE(email, ''),
  encrypted_password = COALESCE(encrypted_password, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone = COALESCE(phone, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb);

-- Now alter the columns to set defaults and NOT NULL constraints
ALTER TABLE auth.users
  ALTER COLUMN aud SET DEFAULT '',
  ALTER COLUMN aud SET NOT NULL,
  
  ALTER COLUMN role SET DEFAULT '',
  ALTER COLUMN role SET NOT NULL,
  
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN email SET NOT NULL,
  
  ALTER COLUMN encrypted_password SET DEFAULT '',
  ALTER COLUMN encrypted_password SET NOT NULL,
  
  ALTER COLUMN email_change SET DEFAULT '',
  ALTER COLUMN email_change SET NOT NULL,
  
  ALTER COLUMN email_change_token_new SET DEFAULT '',
  ALTER COLUMN email_change_token_new SET NOT NULL,
  
  ALTER COLUMN email_change_token_current SET DEFAULT '',
  ALTER COLUMN email_change_token_current SET NOT NULL,
  
  ALTER COLUMN phone SET DEFAULT '',
  ALTER COLUMN phone SET NOT NULL,
  
  ALTER COLUMN phone_change SET DEFAULT '',
  ALTER COLUMN phone_change SET NOT NULL,
  
  ALTER COLUMN phone_change_token SET DEFAULT '',
  ALTER COLUMN phone_change_token SET NOT NULL,
  
  ALTER COLUMN recovery_token SET DEFAULT '',
  ALTER COLUMN recovery_token SET NOT NULL,
  
  ALTER COLUMN reauthentication_token SET DEFAULT '',
  ALTER COLUMN reauthentication_token SET NOT NULL,
  
  ALTER COLUMN raw_app_meta_data SET DEFAULT '{}'::jsonb,
  ALTER COLUMN raw_app_meta_data SET NOT NULL,
  
  ALTER COLUMN raw_user_meta_data SET DEFAULT '{}'::jsonb,
  ALTER COLUMN raw_user_meta_data SET NOT NULL;