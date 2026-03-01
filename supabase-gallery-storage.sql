-- Create the gallery storage bucket (run this first)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- RLS is already enabled on storage.objects by default in Supabase
-- Now create the policies:

-- Policy: Anyone can view files in the gallery bucket
CREATE POLICY "Public read access for gallery"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- Policy: Anyone can upload files to the gallery bucket (public uploads)
CREATE POLICY "Public upload access for gallery"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'gallery');

-- Policy: Only authenticated users can delete (for admin cleanup)
CREATE POLICY "Authenticated users can delete gallery files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');
