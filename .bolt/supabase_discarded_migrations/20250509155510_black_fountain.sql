-- Function to set user role in auth.users
CREATE OR REPLACE FUNCTION set_user_role(user_id uuid, role text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    CASE 
      WHEN raw_app_meta_data IS NULL THEN 
        jsonb_build_object('role', role)
      ELSE 
        raw_app_meta_data || jsonb_build_object('role', role)
    END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set role for rep user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the auth user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'rep1@maryadha.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Set role to 'rep'
    PERFORM set_user_role(v_user_id, 'rep');
    
    -- Ensure rep record exists and is linked
    UPDATE reps
    SET 
      user_id = v_user_id,
      active = true,
      updated_at = now()
    WHERE email = 'rep1@maryadha.com';

    -- Insert if not exists
    IF NOT FOUND THEN
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
        'rep1@maryadha.com',
        v_user_id,
        true,
        now(),
        now()
      );
    END IF;
  END IF;
END $$;

-- Update auth.users trigger to handle role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if user exists in reps table
  IF EXISTS (
    SELECT 1 FROM reps 
    WHERE email = NEW.email
  ) THEN
    -- Set role to 'rep' for rep users
    PERFORM set_user_role(NEW.id, 'rep');
  ELSE
    -- Default to 'brand' role
    PERFORM set_user_role(NEW.id, 'brand');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;