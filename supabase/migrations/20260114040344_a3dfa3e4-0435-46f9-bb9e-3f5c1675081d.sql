-- Create enum for press release status
CREATE TYPE public.press_release_status AS ENUM ('draft', 'ready_for_review', 'approved', 'published', 'archived');

-- Create enum for distribution status
CREATE TYPE public.distribution_status AS ENUM ('not_started', 'prepared', 'approved_to_submit', 'submitted_manual', 'submitted_auto', 'published_on_wires');

-- Create press_releases table
CREATE TABLE public.press_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  publish_date TIMESTAMP WITH TIME ZONE,
  status public.press_release_status NOT NULL DEFAULT 'draft',
  body_html TEXT,
  summary TEXT,
  category TEXT,
  tags TEXT[],
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  og_image_url TEXT,
  robots_index BOOLEAN DEFAULT true,
  
  -- Distribution fields
  distribution_status public.distribution_status NOT NULL DEFAULT 'not_started',
  approval_note TEXT,
  one_click_approve BOOLEAN DEFAULT false,
  
  -- UTM fields
  utm_campaign TEXT,
  utm_source TEXT DEFAULT 'press',
  utm_medium TEXT DEFAULT 'organic',
  
  -- Generated content fields
  linkedin_post TEXT,
  instagram_caption TEXT,
  pitch_email TEXT,
  wire_summary TEXT,
  wire_title TEXT,
  wire_keywords TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.press_releases ENABLE ROW LEVEL SECURITY;

-- Public can read published press releases
CREATE POLICY "Anyone can view published press releases"
ON public.press_releases
FOR SELECT
USING (status = 'published');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_press_release_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_press_releases_updated_at
BEFORE UPDATE ON public.press_releases
FOR EACH ROW
EXECUTE FUNCTION public.update_press_release_updated_at();

-- Enable realtime for press_releases
ALTER PUBLICATION supabase_realtime ADD TABLE public.press_releases;