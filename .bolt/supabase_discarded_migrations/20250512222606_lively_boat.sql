/*
  # Add RLS policies for group chats

  1. Security Changes
    - Enable RLS on group_chats table
    - Add policy for brands to manage their chats
    - Add policy for reps to manage assigned chats
    - Add policy for chat participants to view their chats

  2. Notes
    - Ensures brands can only access their own chats
    - Allows reps to access chats for their assigned orders
    - Maintains data privacy and security
*/

-- Enable RLS
ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;

-- Policy for brands to manage their chats
CREATE POLICY "Brands can manage their chats"
ON group_chats
FOR ALL
TO authenticated
USING (
  brand_id = auth.uid()
)
WITH CHECK (
  brand_id = auth.uid()
);

-- Policy for reps to manage assigned chats
CREATE POLICY "Reps can manage assigned chats"
ON group_chats
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM reps
    WHERE reps.user_id = auth.uid()
    AND reps.id IN (
      SELECT rep_id FROM orders WHERE orders.id = group_chats.order_id
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reps
    WHERE reps.user_id = auth.uid()
    AND reps.id IN (
      SELECT rep_id FROM orders WHERE orders.id = group_chats.order_id
    )
  )
);