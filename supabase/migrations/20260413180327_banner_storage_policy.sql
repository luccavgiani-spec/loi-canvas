-- Allow anonymous users to list objects in the public banner bucket.
-- The bucket is set to public:true (enabling direct file downloads),
-- but Supabase storage still enforces RLS for list() API calls.
-- Without this policy, supabase.storage.from('banner').list() returns
-- null for anonymous users, preventing hero banner images from loading.

CREATE POLICY "banner_public_list"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'banner');
