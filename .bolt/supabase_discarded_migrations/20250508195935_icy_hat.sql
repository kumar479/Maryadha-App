/*
  # Messaging System Implementation

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `chat_id` (uuid, references group_chats)
      - `sender_id` (uuid, references auth.users)
      - `content` (text)
      - `type` (text: 'text', 'image', 'file')
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `message_templates`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for message access
    - Add policies for template access

  3. Changes
    - Add message syncing capabilities
    - Add template management
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES group_chats(id),
  sender_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'image', 'file')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('sample_status', 'payment', 'production', 'general')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on message templates
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Chat participants can view messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM chat_participants 
      WHERE chat_id = messages.chat_id
    )
  );

CREATE POLICY "Chat participants can insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM chat_participants 
      WHERE chat_id = chat_id
    )
  );

-- Create policies for message templates
CREATE POLICY "Reps can view message templates"
  ON message_templates
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM reps
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default message templates
INSERT INTO message_templates (title, content, category) VALUES
  ('Sample in Production', 'Your sample is currently in production. We''ll update you as soon as it''s ready for review.', 'sample_status'),
  ('Payment Received', 'We''ve received your payment. Production will commence according to the agreed timeline.', 'payment'),
  ('Production Update', 'Production is progressing as scheduled. Current completion: {{progress}}%.', 'production'),
  ('After Hours', 'Thank you for your message. Our team will get back to you within 24 hours.', 'general');