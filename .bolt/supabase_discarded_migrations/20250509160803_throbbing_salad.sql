-- Drop and recreate the set_user_role function with better error handling
CREATE OR REPLACE FUNCTION set_user_role(p_user_id uuid, p_role text)
RETURNS void AS $$
BEGIN
  -- Validate role
  IF p_role NOT IN ('rep', 'brand') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Update user metadata with role
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(p_role)
  )
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to reps email
ALTER TABLE reps ADD CONSTRAINT reps_email_key UNIQUE (email);

-- Function to ensure rep record exists
CREATE OR REPLACE FUNCTION ensure_rep_record(p_email text, p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO reps (
    name,
    email,
    user_id,
    active,
    created_at,
    updated_at
  )
  VALUES (
    'Test Rep',
    p_email,
    p_user_id,
    true,
    now(),
    now()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    user_id = p_user_id,
    active = true,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if user should be a rep
  IF EXISTS (
    SELECT 1 FROM reps 
    WHERE email = NEW.email
  ) THEN
    -- Set role to 'rep'
    PERFORM set_user_role(NEW.id, 'rep');
    -- Ensure rep record is properly linked
    PERFORM ensure_rep_record(NEW.email, NEW.id);
  ELSE
    -- Default to 'brand' role
    PERFORM set_user_role(NEW.id, 'brand');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fix existing rep user
DO $$
DECLARE
  v_user_id uuid;
  v_rep_email text := 'rep1@maryadha.com';
BEGIN
  -- Get the auth user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_rep_email
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Ensure role is set correctly
    PERFORM set_user_role(v_user_id, 'rep');
    -- Ensure rep record exists and is linked
    PERFORM ensure_rep_record(v_rep_email, v_user_id);
  END IF;
END $$;

-- Update RLS policies
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "reps_view_own_profile" ON reps;
DROP POLICY IF EXISTS "reps_update_own_data" ON reps;
DROP POLICY IF EXISTS "brands_view_order_reps" ON reps;
DROP POLICY IF EXISTS "brands_view_sample_reps" ON reps;

-- Create updated policies
CREATE POLICY "reps_view_own_profile"
  ON reps
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (SELECT raw_app_meta_data->>'role' = 'rep' FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "reps_update_own_data"
  ON reps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brands_view_order_reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT rep_id 
      FROM orders 
      WHERE brand_id = auth.uid()
    ) OR
    (SELECT raw_app_meta_data->>'role' = 'rep' FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "brands_view_sample_reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT rep_id 
      FROM samples 
      WHERE brand_id = auth.uid()
    ) OR
    (SELECT raw_app_meta_data->>'role' = 'rep' FROM auth.users WHERE id = auth.uid())
  );

-- Verify and fix any existing users
DO $$
DECLARE
  v_user record;
BEGIN
  -- Find users without roles
  FOR v_user IN 
    SELECT id, email
    FROM auth.users
    WHERE raw_app_meta_data->>'role' IS NULL
  LOOP
    -- Set appropriate role based on email
    IF EXISTS (SELECT 1 FROM reps WHERE email = v_user.email) THEN
      PERFORM set_user_role(v_user.id, 'rep');
      PERFORM ensure_rep_record(v_user.email, v_user.id);
    ELSE
      PERFORM set_user_role(v_user.id, 'brand');
    END IF;
  END LOOP;
END $$;