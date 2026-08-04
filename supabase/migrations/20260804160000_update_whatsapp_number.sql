-- Update the site-wide WhatsApp click-to-chat number used by "Order now" buttons
UPDATE public.site_settings SET
  whatsapp_number = '15078179129',
  phone = '+1 507-817-9129',
  updated_at = now()
WHERE id = 1;

-- Ensure the product-images storage bucket exists and is public,
-- so admin-uploaded product photos resolve via a public URL on the storefront.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- A public bucket only grants read access via the public URL. Writes still go
-- through storage.objects, which has RLS enabled with no permissive policies by
-- default, so the admin uploader needs an explicit INSERT policy to work.
-- Postgres has no CREATE POLICY IF NOT EXISTS, so drop first to stay re-runnable.
DROP POLICY IF EXISTS "product_images_insert" ON storage.objects;
CREATE POLICY "product_images_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_delete" ON storage.objects;
CREATE POLICY "product_images_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
