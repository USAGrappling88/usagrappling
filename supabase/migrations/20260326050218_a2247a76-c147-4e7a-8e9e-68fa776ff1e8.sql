
CREATE TABLE public.world_team_petitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  membership_number text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dob date NOT NULL,
  sex text NOT NULL,
  competition_weight_kg numeric NOT NULL,
  belt_ranking text,
  notable_accomplishments text,
  self_fund boolean NOT NULL DEFAULT false,
  style text NOT NULL,
  competition_type text NOT NULL,
  rashguard_size text,
  short_size text,
  shirt_size text,
  hoodie_size text,
  pants_size text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  admin_rating integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.world_team_petitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit petitions" ON public.world_team_petitions
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND admin_notes IS NULL AND admin_rating IS NULL);

CREATE POLICY "Admins can view petitions" ON public.world_team_petitions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update petitions" ON public.world_team_petitions
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete petitions" ON public.world_team_petitions
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
