-- Restore EXECUTE on role-check functions used by RLS policies.
-- These functions are safe to expose: they only return whether a user holds a role.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO anon, authenticated;