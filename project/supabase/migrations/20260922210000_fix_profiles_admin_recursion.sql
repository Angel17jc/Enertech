/*
  # Fix infinite recursion in the profiles admin policy

  ## Why
  "Admins can view all profiles" checked the admin role with a subquery on
  `profiles` itself. Postgres applies the same policies to that subquery, so
  any SELECT on `profiles` failed with:

    infinite recursion detected in policy for relation "profiles"

  That broke every user reading their own profile, and every admin policy on
  other tables, since they all look up the role in `profiles`.

  ## Changes
  1. `public.is_admin()` - returns whether the current user is an admin. It is
     SECURITY DEFINER, so its lookup on `profiles` skips RLS and cannot recurse.
  2. "Admins can view all profiles" now uses `is_admin()`.

  The admin policies on other tables keep their EXISTS subquery: it only reads
  the user's own profile row, which "Users can view own profile" allows.

  Safe to run more than once.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());
