DROP POLICY IF EXISTS "Anyone can view published press releases" ON public.press_releases;

CREATE POLICY "Admins can view all press releases"
ON public.press_releases FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.press_releases_public
WITH (security_invoker = false) AS
SELECT
  id, title, slug, publish_date, status, body_html, summary, category, tags,
  meta_title, meta_description, canonical_url, og_image_url, robots_index,
  created_at, updated_at
FROM public.press_releases
WHERE status = 'published';

GRANT SELECT ON public.press_releases_public TO anon, authenticated;