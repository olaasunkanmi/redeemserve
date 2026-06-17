
-- Vendors can manage their own kyc files (path begins with their vendor id)
CREATE POLICY "vendor uploads own kyc"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = v.id::text
  )
);

CREATE POLICY "vendor reads own kyc"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (
    EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.owner_id = auth.uid()
        AND (storage.foldername(name))[1] = v.id::text
    )
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "vendor replaces own kyc"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.owner_id = auth.uid()
      AND (storage.foldername(name))[1] = v.id::text
  )
);

REVOKE EXECUTE ON FUNCTION public.admin_set_kyc(uuid, text, text) FROM PUBLIC;
