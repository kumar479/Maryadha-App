-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  data jsonb,
  read boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create user_push_tokens table
create table if not exists public.user_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  token text not null,
  platform text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.notifications enable row level security;
alter table public.user_push_tokens enable row level security;

-- Allow users to read their own notifications
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
create policy "Users can read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Allow the system to create notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

-- Allow users to mark their own notifications as read
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to manage their own push tokens
DROP POLICY IF EXISTS "Users can manage their own push tokens" ON public.user_push_tokens;
create policy "Users can manage their own push tokens"
  on public.user_push_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create function to update updated_at on notifications
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger to update updated_at on notifications
create trigger handle_notifications_updated_at
  before update on public.notifications
  for each row
  execute function public.handle_updated_at();

-- Create trigger to update updated_at on user_push_tokens
create trigger handle_user_push_tokens_updated_at
  before update on public.user_push_tokens
  for each row
  execute function public.handle_updated_at(); 