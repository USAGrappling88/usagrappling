-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Drop the permissive policies on press_releases
DROP POLICY IF EXISTS "Anyone can create press releases" ON public.press_releases;
DROP POLICY IF EXISTS "Anyone can update press releases" ON public.press_releases;
DROP POLICY IF EXISTS "Anyone can delete press releases" ON public.press_releases;
DROP POLICY IF EXISTS "Anyone can view all press releases" ON public.press_releases;

-- Create admin-only policies for press_releases
CREATE POLICY "Admins can create press releases"
ON public.press_releases
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update press releases"
ON public.press_releases
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete press releases"
ON public.press_releases
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view published press releases"
ON public.press_releases
FOR SELECT
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

-- Update storage policies for admin-only uploads
DROP POLICY IF EXISTS "Anyone can upload press images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update press images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete press images" ON storage.objects;

CREATE POLICY "Admins can upload press images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'press-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update press images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'press-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete press images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'press-images' AND public.has_role(auth.uid(), 'admin'));