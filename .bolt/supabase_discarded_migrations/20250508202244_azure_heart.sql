/*
  # Create Test Rep Account

  1. New Data
    - Creates a test rep user for development
    - Associates user with rep record
    - Sets up necessary permissions

  2. Security
    - Password will be 'test123'
    - Account is marked as active
*/

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
  active,
  public_name
) 
SELECT 
  id as user_id,
  'Test Rep' as name,
  'rep@maryadha.com' as email,
  true as active,
  'Test Rep' as public_name
FROM auth.users
WHERE email = 'rep@maryadha.com';