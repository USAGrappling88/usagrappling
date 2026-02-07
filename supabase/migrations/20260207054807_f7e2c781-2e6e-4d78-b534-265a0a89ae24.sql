-- Create enum for event styles
CREATE TYPE public.event_style AS ENUM ('catch_wrestling', 'college', 'grappling', 'sport_jiu_jitsu');

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT NOT NULL,
  state_abbr TEXT NOT NULL,
  notes TEXT,
  registration_url TEXT,
  style public.event_style NOT NULL DEFAULT 'grappling',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view non-archived upcoming events
CREATE POLICY "Anyone can view active events"
ON public.events
FOR SELECT
USING (is_archived = false OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can create events
CREATE POLICY "Admins can create events"
ON public.events
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update events
CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete events
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates (reusing existing function)
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_press_release_updated_at();

-- Create index for faster date-based queries
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_style ON public.events(style);
CREATE INDEX idx_events_archived ON public.events(is_archived);