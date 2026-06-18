-- Remove the previous security-definer view (flagged by linter)
DROP VIEW IF EXISTS public.press_releases_public;

-- Restore public-readable rows on base table (anyone can read published rows),
-- but anonymous role will only get the safe columns via column-level GRANTs below.
DROP POLICY IF EXISTS "Admins can view all press releases" ON public.press_releases;
CREATE POLICY "Anyone can view published press releases"
ON public.press_releases FOR SELECT
USING (status = 'published'::press_release_status OR has_role(auth.uid(), 'admin'::app_role));

-- Lock down anon column access: revoke broad SELECT and only grant safe public columns
REVOKE SELECT ON public.press_releases FROM anon;
GRANT SELECT (
  id, title, slug, publish_date, status, body_html, summary, category, tags,
  meta_title, meta_description, canonical_url, og_image_url, robots_index,
  created_at, updated_at
) ON public.press_releases TO anon;

-- Authenticated users (including admins) retain full column access; RLS still applies
GRANT SELECT ON public.press_releases TO authenticated;