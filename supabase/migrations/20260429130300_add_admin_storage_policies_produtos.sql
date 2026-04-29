-- Storage policies for the 'produtos' bucket. The bucket is public:true
-- (read works without policy via the public CDN URL), but write operations
-- through supabase.storage.from('produtos').upload(...) require explicit policies.
-- Admin gating mirrors the public.products policies.

CREATE POLICY "admin can upload to produtos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'produtos'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "admin can update produtos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'produtos'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'produtos'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "admin can delete produtos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'produtos'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
