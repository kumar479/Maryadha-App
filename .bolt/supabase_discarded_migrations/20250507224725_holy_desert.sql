/*
  # Add Messages and Notifications Tables

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `text` (text)
      - `source` (text)
      - `factory_id` (uuid)
      - `user_id` (uuid)
      - `timestamp` (timestamptz)
    - `message_notifications`
      - `id` (uuid, primary key)
      - `message_id` (uuid)
      - `user_id` (uuid)
      - `read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  source text NOT NULL CHECK (source IN ('whatsapp', 'app')),
  factory_id uuid REFERENCES factories(id),
  user_id uuid REFERENCES auth.users(id),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create message notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id),
  user_id uuid REFERENCES auth.users(id),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON message_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON message_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();