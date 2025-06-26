-- Enable email auth provider if not already enabled
UPDATE auth.providers
SET enabled = true
WHERE provider_id = 'email';

-- Update existing rep user's password and confirmation status
UPDATE auth.users
SET 
  encrypted_password = crypt('test123', gen_salt('bf')),
  email_confirmed_at = now(),
  confirmed_at = now(),
  is_sso_user = false,
  raw_app_meta_data = '{"provider":"email","providers":["email"]}',
  raw_user_meta_data = '{"name":"Test Rep"}'
WHERE email = 'rep@maryadha.com';

-- Create rep record if it doesn't exist
INSERT INTO reps (
  user_id,
  name,
  email,
  active
)
SELECT 
  id as user_id,
  'Test Rep' as name,
  'rep@maryadha.com' as email,
  true as active
FROM auth.users
WHERE email = 'rep@maryadha.com'
AND NOT EXISTS (
  SELECT 1 FROM reps WHERE email = 'rep@maryadha.com'
);