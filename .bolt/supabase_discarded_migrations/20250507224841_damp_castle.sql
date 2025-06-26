/*
  # Messages and Notifications Schema

  1. New Tables
    - messages
      - id (uuid, primary key)
      - text (text)
      - source (text, either 'whatsapp' or 'app')
      - factory_id (uuid, references factories)
      - brand_id (uuid, references auth.users)
      - timestamp (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - message_notifications
      - id (uuid, primary key)
      - message_id (uuid, references messages)
      - brand_id (uuid, references auth.users)
      - read (boolean)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for brand-specific access
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  source text NOT NULL,
  factory_id uuid,
  brand_id uuid,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT messages_source_check CHECK (source IN ('whatsapp', 'app')),
  CONSTRAINT messages_factory_id_fkey FOREIGN KEY (factory_id) REFERENCES factories(id),
  CONSTRAINT messages_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES auth.users(id)
);

-- Create message notifications table
CREATE TABLE IF NOT EXISTS message_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid,
  brand_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT message_notifications_message_id_fkey FOREIGN KEY (message_id) REFERENCES messages(id),
  CONSTRAINT message_notifications_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = brand_id);

CREATE POLICY "Users can insert their own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = brand_id);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON message_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = brand_id);

CREATE POLICY "Users can update their own notifications"
  ON message_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = brand_id);

-- Create updated_at trigger
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();