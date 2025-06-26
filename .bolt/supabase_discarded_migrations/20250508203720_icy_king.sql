/*
  # Fix Rep User Association

  1. Changes
    - Add user_id association for existing rep
    - Update RLS policies to handle both brand and rep views
    - Ensure proper role-based access

  2. Security
    - Enable RLS on reps table
    - Add policies for rep self-management
    - Add policies for brand access to rep info
*/

-- Update existing rep record to associate with auth user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the auth user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'rep1@maryadha.com'
  LIMIT 1;

  -- Update or create rep record
  IF v_user_id IS NOT NULL THEN
    UPDATE reps
    SET user_id = v_user_id
    WHERE email = 'rep1@maryadha.com'
    AND user_id IS NULL;

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

-- Enable RLS
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

-- Create policies for rep access
CREATE POLICY "reps_view_own_profile"
  ON reps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reps_update_own_data"
  ON reps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for brands to view limited rep info
CREATE POLICY "brands_view_order_reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT rep_id FROM orders WHERE brand_id = auth.uid()
  ));

CREATE POLICY "brands_view_sample_reps"
  ON reps
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT rep_id FROM samples WHERE brand_id = auth.uid()
  ));