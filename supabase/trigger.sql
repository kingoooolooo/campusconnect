-- ============================================================
-- CAMPUSCONNECT AUTH TRIGGER
-- Execution order: 3 of 5
-- Run AFTER functions.sql in the Supabase SQL Editor.
--
-- When a new user is created in auth.users (via Supabase Auth),
-- this trigger automatically creates their profile in public.profiles.
-- Data is passed via raw_user_meta_data during signUp().
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  _department_id UUID;
  _semester INTEGER;
  _scholar_number TEXT;
  _full_name TEXT;
BEGIN
  -- Extract metadata passed during signUp()
  _scholar_number := NEW.raw_user_meta_data->>'scholar_number';
  _full_name      := NEW.raw_user_meta_data->>'full_name';
  _department_id  := (NEW.raw_user_meta_data->>'department_id')::UUID;
  _semester       := (NEW.raw_user_meta_data->>'semester')::INTEGER;

  -- Validate all required fields are present
  IF _scholar_number IS NULL OR _full_name IS NULL OR _department_id IS NULL OR _semester IS NULL THEN
    RAISE EXCEPTION 'Missing required user metadata fields (scholar_number, full_name, department_id, semester)';
  END IF;

  -- Validate department exists
  IF NOT EXISTS (SELECT 1 FROM public.departments WHERE id = _department_id) THEN
    RAISE EXCEPTION 'Invalid department_id: %', _department_id;
  END IF;

  -- Validate semester is within range for this department
  IF _semester > (SELECT max_semesters FROM public.departments WHERE id = _department_id) THEN
    RAISE EXCEPTION 'Semester % exceeds max_semesters for this department', _semester;
  END IF;

  -- Validate scholar number format (6 digits)
  IF NOT (_scholar_number ~ '^\d{6}$') THEN
    RAISE EXCEPTION 'Invalid scholar_number format: must be exactly 6 digits';
  END IF;

  -- Insert the profile
  INSERT INTO public.profiles (
    id,
    email,
    scholar_number,
    full_name,
    department_id,
    semester
  ) VALUES (
    NEW.id,
    NEW.email,
    _scholar_number,
    _full_name,
    _department_id,
    _semester
  );

  -- Insert welcome notification for the new user
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (
    NEW.id,
    'account_created',
    'Account Created',
    'Your account is pending approval. You will be notified once a department admin approves you.'
  );

  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to avoid duplicate trigger errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
