-- Create message_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id),
  recipient_id uuid REFERENCES auth.users(id),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON message_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON message_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Create sample_notifications table
CREATE TABLE IF NOT EXISTS sample_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid REFERENCES samples(id),
  recipient_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('new_request', 'status_update', 'rep_assigned')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sample_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for sample notifications
CREATE POLICY "Users can view their own sample notifications"
  ON sample_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own sample notifications"
  ON sample_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);