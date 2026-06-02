-- ============================================================
-- CAMPUSCONNECT RLS HELPER FUNCTIONS
-- Execution order: 2 of 5
-- Run AFTER schema.sql in the Supabase SQL Editor.
--
-- These functions run as SECURITY DEFINER so they can bypass
-- RLS when called from within other RLS policies.
-- ============================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Get current user's department_id
CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Get current user's status
CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Check if current user is department admin of a specific department
CREATE OR REPLACE FUNCTION public.is_dept_admin_of(dept_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'department_admin'
    AND department_id = dept_id
  );
$$;

-- Check if current user is muted
CREATE OR REPLACE FUNCTION public.is_user_muted()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_muted FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;
