-- Create storage buckets for the application
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif']),
  ('sample-files', 'sample-files', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif']),
  ('sample-invoices', 'sample-invoices', true, 10485760, ARRAY['application/pdf']),
  ('tech-pack-guides', 'tech-pack-guides', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for the buckets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('images', 'sample-files', 'sample-invoices', 'tech-pack-guides'));

CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload sample files" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'sample-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload sample invoices" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'sample-invoices' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload tech pack guides" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'tech-pack-guides' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own uploads" ON storage.objects FOR UPDATE 
USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploads" ON storage.objects FOR DELETE 
USING (auth.uid()::text = (storage.foldername(name))[1]); 