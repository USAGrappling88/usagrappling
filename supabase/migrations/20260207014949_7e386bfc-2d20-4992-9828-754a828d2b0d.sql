-- Add twitter_post column for Twitter/X content
ALTER TABLE public.press_releases ADD COLUMN IF NOT EXISTS twitter_post text;