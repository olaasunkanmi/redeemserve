
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS kyc_status text NOT NULL DEFAULT 'unsubmitted',
  ADD COLUMN IF NOT EXISTS kyc_doc_path text,
  ADD COLUMN IF NOT EXISTS kyc_notes text,
  ADD COLUMN IF NOT EXISTS kyc_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at timestamptz;

CREATE OR REPLACE FUNCTION public.admin_set_kyc(_vendor_id uuid, _status text, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.vendors
    SET kyc_status = _status,
        kyc_notes = COALESCE(_notes, kyc_notes),
        kyc_reviewed_at = now(),
        verified = (CASE WHEN _status = 'approved' THEN true ELSE verified END)
    WHERE id = _vendor_id;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_set_kyc(uuid, text, text) TO authenticated;
