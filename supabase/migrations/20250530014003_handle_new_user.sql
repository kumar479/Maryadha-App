/*
  # Add handle_new_user trigger

  1. Creates handle_new_user() function that assigns roles and ensures rep records.
  2. Drops the existing on_auth_user_created_brand trigger.
  3. Creates new on_auth_user_created trigger using handle_new_user.
  4. Grants execution privileges on handle_new_user.
*/

-- Create function to set user role and ensure rep association
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Check if user should be a rep
  IF EXISTS (
    SELECT 1 FROM public.reps r WHERE r.email = NEW.email
  ) THEN
    -- Set role to 'rep'
    PERFORM public.set_user_role(NEW.id, 'rep');
    -- Ensure rep record is linked
    PERFORM public.ensure_rep_record(NEW.email, NEW.id);
  ELSE
    -- Default to 'brand'
    PERFORM public.set_user_role(NEW.id, 'brand');
  END IF;

  RETURN NEW;
END;
$$;

-- Replace old trigger
DROP TRIGGER IF EXISTS on_auth_user_created_brand ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute privileges
GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;
