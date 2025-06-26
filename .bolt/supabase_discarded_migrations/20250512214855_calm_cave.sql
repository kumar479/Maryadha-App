/*
  # Add Missing Relationships

  1. Changes
    - Add missing foreign key relationships between tables
    - Add missing indexes for performance
    - Fix relationship between messages and chat participants
    - Add relationship between group chats and orders
    - Add relationship between notifications and users

  2. Indexes
    - Add indexes on foreign keys for better query performance
*/

-- Add missing relationships for messages
ALTER TABLE messages
  ADD CONSTRAINT messages_chat_id_fkey 
  FOREIGN KEY (chat_id) REFERENCES group_chats(id) ON DELETE CASCADE;

-- Add missing relationships for chat_participants
ALTER TABLE chat_participants
  ADD CONSTRAINT chat_participants_chat_id_fkey 
  FOREIGN KEY (chat_id) REFERENCES group_chats(id) ON DELETE CASCADE;

-- Add missing relationships for notifications
ALTER TABLE message_notifications
  ADD CONSTRAINT message_notifications_recipient_id_fkey 
  FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing relationships for sample notifications
ALTER TABLE sample_notifications
  ADD CONSTRAINT sample_notifications_recipient_id_fkey 
  FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing relationships for notification preferences
ALTER TABLE notification_preferences
  ADD CONSTRAINT notification_preferences_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing relationships for order assignments
ALTER TABLE order_assignments
  ADD CONSTRAINT order_assignments_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT order_assignments_rep_id_fkey 
  FOREIGN KEY (rep_id) REFERENCES reps(id) ON DELETE CASCADE;

-- Add missing relationships for sample assignments
ALTER TABLE sample_assignments
  ADD CONSTRAINT sample_assignments_sample_id_fkey 
  FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE,
  ADD CONSTRAINT sample_assignments_rep_id_fkey 
  FOREIGN KEY (rep_id) REFERENCES reps(id) ON DELETE CASCADE;

-- Add missing relationships for order followups
ALTER TABLE order_followups
  ADD CONSTRAINT order_followups_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT order_followups_rep_id_fkey 
  FOREIGN KEY (rep_id) REFERENCES reps(id) ON DELETE CASCADE;

-- Add missing relationships for archived orders
ALTER TABLE archived_orders
  ADD CONSTRAINT archived_orders_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT archived_orders_rep_id_fkey 
  FOREIGN KEY (rep_id) REFERENCES reps(id) ON DELETE CASCADE;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_order_id ON order_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_sample_assignments_sample_id ON sample_assignments(sample_id);
CREATE INDEX IF NOT EXISTS idx_order_followups_order_id ON order_followups(order_id);
CREATE INDEX IF NOT EXISTS idx_archived_orders_order_id ON archived_orders(order_id);