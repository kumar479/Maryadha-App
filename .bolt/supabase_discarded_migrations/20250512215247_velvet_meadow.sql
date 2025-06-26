/*
  # Add Missing Relationships

  1. Changes
    - Add brand_id and factory_id to group_chats
    - Add missing indexes for performance
    - Add missing foreign key constraints
    
  2. Security
    - No changes to RLS policies
*/

-- Add brand and factory relationships to group_chats
ALTER TABLE group_chats
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS factory_id uuid REFERENCES factories(id) ON DELETE CASCADE;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_chats_brand_id ON group_chats(brand_id);
CREATE INDEX IF NOT EXISTS idx_group_chats_factory_id ON group_chats(factory_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_brand_id ON orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_factory_id ON orders(factory_id);
CREATE INDEX IF NOT EXISTS idx_orders_rep_id ON orders(rep_id);
CREATE INDEX IF NOT EXISTS idx_samples_brand_id ON samples(brand_id);
CREATE INDEX IF NOT EXISTS idx_samples_factory_id ON samples(factory_id);
CREATE INDEX IF NOT EXISTS idx_samples_rep_id ON samples(rep_id);

-- Add missing foreign key constraints
ALTER TABLE order_followups
  ADD CONSTRAINT order_followups_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT order_followups_rep_id_fkey 
  FOREIGN KEY (rep_id) REFERENCES reps(id) ON DELETE CASCADE;

ALTER TABLE archived_orders
  ADD CONSTRAINT archived_orders_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT archived_orders_rep_id_fkey 
  FOREIGN KEY (rep_id) REFERENCES reps(id) ON DELETE CASCADE;