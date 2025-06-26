-- Create rep user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'rep@maryadha.com',
  crypt('test123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test Rep"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create rep record
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
WHERE email = 'rep@maryadha.com';

-- Enable email auth provider
UPDATE auth.providers
SET enabled = true
WHERE provider_id = 'email';

-- Ensure the user is confirmed
UPDATE auth.users
SET confirmed_at = now(),
    email_confirmed_at = now(),
    is_sso_user = false
WHERE email = 'rep@maryadha.com';