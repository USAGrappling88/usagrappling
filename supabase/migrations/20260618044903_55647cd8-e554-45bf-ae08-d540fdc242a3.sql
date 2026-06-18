
-- 1) Lock down SECURITY DEFINER functions: revoke from PUBLIC, grant only where needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_press_release_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role / is_super_admin are used inside RLS policies; authenticated needs EXECUTE for policy evaluation
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- triggers / signup helper only need service_role / supabase_auth_admin
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.update_press_release_updated_at() TO service_role;

-- 2) Remove press_releases from realtime publication (not used by the app; prevents draft leakage)
ALTER PUBLICATION supabase_realtime DROP TABLE public.press_releases;

-- 3) Restrict listing of press-images bucket; public CDN URLs still serve files because bucket remains public
DROP POLICY IF EXISTS "Anyone can view press images" ON storage.objects;
CREATE POLICY "Admins can list press images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'press-images' AND public.has_role(auth.uid(), 'admin'));
