-- =============================================
-- Reviews table: rename is_published → approved, add photo_url, FK, RLS
-- =============================================

-- 1. Rename is_published → approved
ALTER TABLE public.reviews RENAME COLUMN is_published TO approved;

-- 2. Add photo_url column
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photo_url text;

-- 3. Clean up orphaned reviews before adding FK
DELETE FROM public.reviews
WHERE product_id IS NOT NULL
  AND product_id NOT IN (SELECT id FROM public.products);

-- 4. Add FK from reviews.product_id → products.id (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_product_id_fkey'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Drop old blanket public read policy
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;

-- 6. New SELECT policy: only approved reviews are visible
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'reviews_approved_public_read'
  ) THEN
    CREATE POLICY "reviews_approved_public_read"
      ON public.reviews FOR SELECT
      USING (approved = true);
  END IF;
END $$;

-- 6. INSERT policy: anyone can submit; approved must be false
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'reviews_anon_insert'
  ) THEN
    CREATE POLICY "reviews_anon_insert"
      ON public.reviews FOR INSERT
      TO anon
      WITH CHECK (approved = false OR approved IS NULL);
  END IF;
END $$;

-- 7. Storage RLS for review-photos bucket (public read, anon upload)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'review_photos_public_read'
  ) THEN
    CREATE POLICY "review_photos_public_read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'review-photos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'review_photos_anon_insert'
  ) THEN
    CREATE POLICY "review_photos_anon_insert"
      ON storage.objects FOR INSERT
      TO anon
      WITH CHECK (bucket_id = 'review-photos');
  END IF;
END $$;
