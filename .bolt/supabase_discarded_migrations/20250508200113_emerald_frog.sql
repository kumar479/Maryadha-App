/*
  # Messaging System Schema

  1. New Tables
    - `messages`: Stores all chat messages
    - `message_templates`: Stores predefined message templates for quick responses

  2. Security
    - Enable RLS on all tables
    - Add policies for chat participants and reps
    - Ensure messages are only visible to participants

  3. Features
    - Message types (text, image, file)
    - Message templates by category
    - Automatic timestamp updates
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id),
  receiver_id uuid REFERENCES auth.users(id),
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
CREATE POLICY "Users can view their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (sender_id, receiver_id)
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
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