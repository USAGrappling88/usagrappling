-- Add RLS policies for creating and managing press releases
-- Since there's no auth yet, we'll allow public access for admin operations temporarily

CREATE POLICY "Anyone can create press releases" 
ON public.press_releases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update press releases" 
ON public.press_releases 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete press releases" 
ON public.press_releases 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view all press releases" 
ON public.press_releases 
FOR SELECT 
USING (true);

-- Drop the restrictive select policy
DROP POLICY IF EXISTS "Anyone can view published press releases" ON public.press_releases;

-- Create storage bucket for press release images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('press-images', 'press-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for press images
CREATE POLICY "Anyone can view press images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'press-images');

CREATE POLICY "Anyone can upload press images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'press-images');

CREATE POLICY "Anyone can update press images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'press-images');

CREATE POLICY "Anyone can delete press images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'press-images');