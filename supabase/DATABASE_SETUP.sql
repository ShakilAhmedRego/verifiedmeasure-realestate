BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DO $$ BEGIN
  CREATE TYPE workflow_status AS ENUM
    ('new','triaged','qualified','in_sequence','engaged','won','lost','do_not_contact');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  website text,
  domain text,
  logo_url text,
  email text,
  phone text,
  stage text,
  arr_estimate numeric,
  employees integer,
  tech_stack text[],
  intelligence_score integer NOT NULL DEFAULT 0,
  workflow workflow_status NOT NULL DEFAULT 'new',
  is_high_priority boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_intel_idx ON public.leads(intelligence_score DESC);
CREATE INDEX IF NOT EXISTS leads_company_trgm_idx ON public.leads USING gin (company gin_trgm_ops);
CREATE INDEX IF NOT EXISTS leads_domain_trgm_idx  ON public.leads USING gin (domain gin_trgm_ops);
CREATE INDEX IF NOT EXISTS leads_tech_gin         ON public.leads USING gin(tech_stack);
CREATE INDEX IF NOT EXISTS leads_meta_gin         ON public.leads USING gin(meta);

CREATE TABLE IF NOT EXISTS public.lead_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lead_id)
);

CREATE INDEX IF NOT EXISTS lead_access_user_idx ON public.lead_access(user_id, granted_at DESC);

CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text,
  ref_type text,
  ref_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_idx ON public.credit_ledger(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.feature_flags (key, enabled, description)
VALUES
  ('ENABLE_ANALYTICS_DASHBOARD', true, 'Enable KPI cards + analytics'),
  ('ENABLE_DETAIL_PANEL', true, 'Enable right-side detail drawer'),
  ('ENABLE_SPARKLINES', true, 'Enable sparkline visuals'),
  ('ENABLE_COMMAND_PALETTE', true, 'Enable Cmd+K command palette')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'leads_set_updated_at') THEN
    CREATE TRIGGER leads_set_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.dashboard_metrics AS
SELECT
  COUNT(*)::int AS total_companies,
  COALESCE(AVG(intelligence_score),0)::numeric AS avg_score
FROM public.leads
WHERE is_archived = false;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.stage_breakdown AS
SELECT
  COALESCE(stage,'Unknown') AS stage,
  COUNT(*)::int AS company_count
FROM public.leads
WHERE is_archived = false
GROUP BY COALESCE(stage,'Unknown');

CREATE OR REPLACE FUNCTION public.refresh_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.dashboard_metrics;
  REFRESH MATERIALIZED VIEW public.stage_breakdown;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_preview" ON public.leads;
CREATE POLICY "leads_preview"
ON public.leads
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "lead_access_read_own" ON public.lead_access;
CREATE POLICY "lead_access_read_own"
ON public.lead_access
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ledger_read_own" ON public.credit_ledger;
CREATE POLICY "ledger_read_own"
ON public.credit_ledger
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_read_own" ON public.user_profiles;
CREATE POLICY "profiles_read_own"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "flags_read" ON public.feature_flags;
CREATE POLICY "flags_read"
ON public.feature_flags
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.unlock_leads_secure(p_lead_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid;
  cost int;
  bal int;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  cost := COALESCE(array_length(p_lead_ids, 1), 0);
  IF cost <= 0 THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(amount),0)::int
  INTO bal
  FROM public.credit_ledger
  WHERE user_id = uid;

  IF bal < cost THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  INSERT INTO public.lead_access (user_id, lead_id)
  SELECT uid, unnest(p_lead_ids)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.credit_ledger (user_id, amount, reason, ref_type)
  VALUES (uid, -cost, 'unlock', 'unlock');

  PERFORM public.refresh_analytics();
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_leads_secure(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_leads_secure(uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin(p_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = p_user AND up.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_grant_credits(p_user_id uuid, p_amount int, p_reason text DEFAULT 'admin_grant')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller uuid;
BEGIN
  caller := auth.uid();
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_admin(caller) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.credit_ledger (user_id, amount, reason, ref_type)
  VALUES (p_user_id, p_amount, p_reason, 'admin_grant');

  PERFORM public.refresh_analytics();
END;
$$;

REVOKE ALL ON FUNCTION public.admin_grant_credits(uuid,int,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_grant_credits(uuid,int,text) TO authenticated;

COMMIT;
