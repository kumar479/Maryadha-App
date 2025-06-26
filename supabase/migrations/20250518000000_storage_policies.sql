-- Enable storage by creating buckets if they don't exist
insert into storage.buckets (id, name, public)
values ('sample-files', 'sample-files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Create policies for sample-files bucket
drop policy if exists "Authenticated users can upload sample files" on storage.objects;
create policy "Authenticated users can upload sample files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'sample-files' AND
  auth.role() = 'authenticated'
);

drop policy if exists "Authenticated users can read sample files" on storage.objects;
create policy "Authenticated users can read sample files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'sample-files' AND
  auth.role() = 'authenticated'
);

-- Create policies for images bucket
drop policy if exists "Authenticated users can upload images" on storage.objects;
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);

drop policy if exists "Anyone can read images" on storage.objects;
create policy "Anyone can read images"
on storage.objects for select
using (bucket_id = 'images'); 