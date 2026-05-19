-- PrintFlow vendor RBAC and partner shop tables
create extension if not exists pgcrypto;

DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('student', 'vendor', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE public.shop_status AS ENUM ('pending', 'verified', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE public.shop_tier AS ENUM ('standard', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.print_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  wait_time integer NOT NULL DEFAULT 15,
  online boolean NOT NULL DEFAULT false,
  status public.shop_status NOT NULL DEFAULT 'pending',
  tier public.shop_tier NOT NULL DEFAULT 'standard',
  hours text NOT NULL DEFAULT '',
  services text[] NOT NULL DEFAULT '{}'::text[],
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles (role);
CREATE INDEX IF NOT EXISTS print_shops_status_online_idx ON public.print_shops (status, online);
CREATE INDEX IF NOT EXISTS print_shops_owner_idx ON public.print_shops (owner_id);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_print_shops_updated_at ON public.print_shops;
CREATE TRIGGER set_print_shops_updated_at
BEFORE UPDATE ON public.print_shops
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_shops ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
  );
$$;

CREATE POLICY "Profiles can read own row"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_superadmin());

CREATE POLICY "Profiles can insert own row"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_superadmin());

CREATE POLICY "Profiles can update own row"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_superadmin())
  WITH CHECK (auth.uid() = id OR public.is_superadmin());

CREATE POLICY "Superadmins can delete profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

CREATE POLICY "Public can read verified online shops"
  ON public.print_shops
  FOR SELECT
  TO anon, authenticated
  USING ((status = 'verified') AND online = true OR owner_id = auth.uid() OR public.is_superadmin());

CREATE POLICY "Vendors can insert their shop"
  ON public.print_shops
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_superadmin());

CREATE POLICY "Vendors can update their shop"
  ON public.print_shops
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (owner_id = auth.uid() OR public.is_superadmin());

CREATE POLICY "Superadmins can delete any shop"
  ON public.print_shops
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());
