
-- Application type enum
CREATE TYPE public.application_type AS ENUM ('officiate', 'staff');

-- Main applications table
CREATE TABLE public.staff_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type public.application_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Step 1: Personal Profile (shared)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  dob DATE NOT NULL,
  membership_number TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  
  -- Step 2: Credentials (officiate) / Experience (staff)
  primary_background TEXT,
  certifications TEXT[] DEFAULT '{}',
  certification_other TEXT,
  ruleset_expertise TEXT[] DEFAULT '{}',
  smoothcomp TEXT,
  experience TEXT,
  
  -- Staff-specific
  worked_with_usag_before BOOLEAN,
  positions TEXT[] DEFAULT '{}',
  
  -- Step 3: Logistics (shared)
  interested_roles TEXT[] DEFAULT '{}',
  shirt_size TEXT,
  travel_radius TEXT,
  payment_method TEXT,
  
  -- Paycheck info (shared)
  pay_address TEXT,
  pay_city TEXT,
  pay_state TEXT,
  pay_zip TEXT,
  
  -- Admin fields
  admin_grade INTEGER CHECK (admin_grade >= 1 AND admin_grade <= 5),
  admin_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- RLS
ALTER TABLE public.staff_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit applications"
  ON public.staff_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view applications"
  ON public.staff_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update (grading)
CREATE POLICY "Admins can update applications"
  ON public.staff_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete applications"
  ON public.staff_applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
