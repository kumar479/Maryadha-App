-- Add sample_id column to group_chats for sample request threads
ALTER TABLE public.group_chats ADD COLUMN IF NOT EXISTS sample_id uuid;

-- Store image attachments in messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachments text[];
