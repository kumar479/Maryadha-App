/*
  # Clean brand users and set NOT NULL constraints

  1. Updates
    - Sets default values for NULL fields in auth.users table for brand users
    - Ensures data consistency by replacing NULLs with empty strings
  
  2. Constraints
    - Adds NOT NULL constraints to critical user fields
    - Sets default values to prevent future NULL entries
*/

-- First update brand users to have no NULL values
UPDATE auth.users
SET
  aud                        = COALESCE(aud,                        ''),
  role                       = COALESCE(role,                       ''),
  email                      = COALESCE(email,                      ''),
  encrypted_password         = COALESCE(encrypted_password,         ''),
  recovery_token             = COALESCE(recovery_token,             ''),
  email_change_token_new     = COALESCE(email_change_token_new,     ''),
  phone                      = COALESCE(phone,                      ''),
  phone_change               = COALESCE(phone_change,               ''),
  phone_change_token         = COALESCE(phone_change_token,         ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token     = COALESCE(reauthentication_token,     '')
WHERE role = 'brand';

-- Now set NOT NULL constraints and defaults
DO $$ 
BEGIN
  -- Only alter columns if they are nullable
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'aud' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE auth.users
      ALTER COLUMN aud                        SET DEFAULT ''::text, ALTER COLUMN aud                        SET NOT NULL,
      ALTER COLUMN role                       SET DEFAULT ''::text, ALTER COLUMN role                       SET NOT NULL,
      ALTER COLUMN email                      SET DEFAULT ''::text, ALTER COLUMN email                      SET NOT NULL,
      ALTER COLUMN encrypted_password         SET DEFAULT ''::text, ALTER COLUMN encrypted_password         SET NOT NULL,
      ALTER COLUMN recovery_token             SET DEFAULT ''::text, ALTER COLUMN recovery_token             SET NOT NULL,
      ALTER COLUMN email_change_token_new     SET DEFAULT ''::text, ALTER COLUMN email_change_token_new     SET NOT NULL,
      ALTER COLUMN phone                      SET DEFAULT ''::text, ALTER COLUMN phone                      SET NOT NULL,
      ALTER COLUMN phone_change               SET DEFAULT ''::text, ALTER COLUMN phone_change               SET NOT NULL,
      ALTER COLUMN phone_change_token         SET DEFAULT ''::text, ALTER COLUMN phone_change_token         SET NOT NULL,
      ALTER COLUMN email_change_token_current SET DEFAULT ''::text, ALTER COLUMN email_change_token_current SET NOT NULL,
      ALTER COLUMN reauthentication_token     SET DEFAULT ''::text, ALTER COLUMN reauthentication_token     SET NOT NULL;
  END IF;
END $$;