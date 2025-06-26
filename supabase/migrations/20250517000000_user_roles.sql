-- Create function to handle user role assignment based on email domain
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    domain text;
    user_role text;
BEGIN
    -- Extract domain from email
    domain := split_part(NEW.email, '@', 2);
    
    -- Determine role based on domain
    IF domain = 'maryadha.com' THEN
        user_role := 'rep';
    ELSE
        user_role := 'brand';
    END IF;

    -- Update user's role in auth.users
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(user_role),
        true
    )
    WHERE id = NEW.id;

    -- Insert into appropriate role-specific table
    IF user_role = 'rep' THEN
        INSERT INTO public.reps (
            user_id,
            email,
            name,
            active
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_app_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            true
        );
    ELSE
        INSERT INTO public.brands (
            id,
            email,
            name,
            website,
            logo_url
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_app_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            '',
            ''
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create reps table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create brands table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.brands (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    name text NOT NULL,
    website text,
    logo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create trigger to handle new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policies
ALTER TABLE public.reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Reps policies
DROP POLICY IF EXISTS "Reps can view their own profile" ON public.reps;
CREATE POLICY "Reps can view their own profile"
    ON public.reps FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reps can update their own profile" ON public.reps;
CREATE POLICY "Reps can update their own profile"
    ON public.reps FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Brands policies
DROP POLICY IF EXISTS "Brands can view their own profile" ON public.brands;
CREATE POLICY "Brands can view their own profile"
    ON public.brands FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Brands can update their own profile" ON public.brands;
CREATE POLICY "Brands can update their own profile"
    ON public.brands FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Allow public to view brand profiles
DROP POLICY IF EXISTS "Public can view brand profiles" ON public.brands;
CREATE POLICY "Public can view brand profiles"
    ON public.brands FOR SELECT
    TO anon
    USING (true);
