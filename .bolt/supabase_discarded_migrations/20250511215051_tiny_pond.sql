/*
  # Fix nullable text fields in auth.users

  1. Changes
    - Updates all nullable text fields to have empty string defaults
    - Sets NOT NULL constraint on these fields
    - Backfills existing NULL values with empty strings

  2. Fields Updated
    - email_change
    - phone
    - phone_change
    - email_confirm_token
    - phone_confirm_token
    - reauthentication_token
    - recovery_token
    - confirmation_token
    - invited_email
    - raw_app_meta_data
    - raw_user_meta_data

  3. Security
    - No data loss - existing NULLs converted to empty strings
    - Maintains data integrity with NOT NULL constraints
*/

-- First update any existing NULL values to empty strings
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
  raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb);

-- Now alter the columns to set defaults and NOT NULL constraints
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