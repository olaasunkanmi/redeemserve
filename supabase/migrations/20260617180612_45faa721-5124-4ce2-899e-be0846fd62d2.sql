
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS kyc_type text,
  ADD COLUMN IF NOT EXISTS kyc_full_name text,
  ADD COLUMN IF NOT EXISTS kyc_id_number text,
  ADD COLUMN IF NOT EXISTS kyc_dob date,
  ADD COLUMN IF NOT EXISTS kyc_address text,
  ADD COLUMN IF NOT EXISTS kyc_doc_back_path text,
  ADD COLUMN IF NOT EXISTS kyc_selfie_path text;
