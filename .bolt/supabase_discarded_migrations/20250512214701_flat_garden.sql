/*
  # Fix Database Relationships and Security

  1. Changes
    - Add foreign key constraints for orders, samples, messages, and feedback tables
    - Enable RLS on all tables
    - Add RLS policies for data access control
    
  2. Security
    - Enable RLS on all tables
    - Add policies for brands and reps to access their data
*/

-- Fix orders table relationships
ALTER TABLE orders
  ADD CONSTRAINT orders_brand_id_fkey 
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

-- Fix samples table relationships
ALTER TABLE samples
  ADD CONSTRAINT samples_brand_id_fkey 
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

-- Fix order_issues table relationships
ALTER TABLE order_issues
  ADD CONSTRAINT order_issues_brand_id_fkey 
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

-- Fix order_feedback table relationships
ALTER TABLE order_feedback
  ADD CONSTRAINT order_feedback_brand_id_fkey 
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for orders
CREATE POLICY "Brands can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (brand_id = auth.uid());

CREATE POLICY "Reps can view assigned orders"
  ON orders FOR SELECT
  TO authenticated
  USING (rep_id IN (
    SELECT id FROM reps WHERE user_id = auth.uid()
  ));

-- Add RLS policies for samples
CREATE POLICY "Brands can view their own samples"
  ON samples FOR SELECT
  TO authenticated
  USING (brand_id = auth.uid());

CREATE POLICY "Reps can view assigned samples"
  ON samples FOR SELECT
  TO authenticated
  USING (rep_id IN (
    SELECT id FROM reps WHERE user_id = auth.uid()
  ));

-- Add RLS policies for messages
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid()
  );

-- Add RLS policies for group_chats
CREATE POLICY "Chat participants can view their chats"
  ON group_chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_id = id AND user_id = auth.uid()
    )
  );

-- Add RLS policies for order_issues
CREATE POLICY "Brands can view their order issues"
  ON order_issues FOR SELECT
  TO authenticated
  USING (brand_id = auth.uid());

CREATE POLICY "Reps can view assigned order issues"
  ON order_issues FOR SELECT
  TO authenticated
  USING (rep_id IN (
    SELECT id FROM reps WHERE user_id = auth.uid()
  ));

-- Add RLS policies for order_feedback
CREATE POLICY "Brands can view their own feedback"
  ON order_feedback FOR SELECT
  TO authenticated
  USING (brand_id = auth.uid());

CREATE POLICY "Reps can view feedback for their orders"
  ON order_feedback FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE rep_id IN (
        SELECT id FROM reps WHERE user_id = auth.uid()
      )
    )
  );