
REVOKE EXECUTE ON FUNCTION public.compute_order_fees() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_vendor_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_vendor_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
