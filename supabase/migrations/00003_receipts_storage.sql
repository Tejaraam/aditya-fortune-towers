-- Create the storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to receipts
CREATE POLICY "Public Receipt Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update their own uploads (optional, but good)
CREATE POLICY "Authenticated users can update receipts"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'receipts' AND auth.role() = 'authenticated' );
