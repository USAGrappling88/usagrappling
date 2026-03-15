
-- Drop the existing overly permissive INSERT policy
DROP POLICY "Anyone can submit applications" ON public.staff_applications;

-- Create a restrictive INSERT policy that prevents applicants from setting admin fields
CREATE POLICY "Anyone can submit applications"
ON public.staff_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND admin_grade IS NULL
  AND admin_notes IS NULL
);
