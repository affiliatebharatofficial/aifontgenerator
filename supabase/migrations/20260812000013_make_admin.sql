-- AI Font Generator Admin Assignment Migration
-- Fixes role escalation trigger for SQL Editor & automatically sets admin role for manorhub533@gmail.com

-- 1. Update prevent_role_escalation function to allow SQL Editor / Direct DB updates (auth.uid() IS NULL)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow direct SQL Editor execution (where auth.uid() is NULL) or admin user execution
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Role escalation denied. Only administrators can modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Upsert profile for manorhub533@gmail.com with role = 'admin'
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'), 
  'admin', 
  created_at, 
  now()
FROM auth.users
WHERE LOWER(email) = 'manorhub533@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', updated_at = now();

-- 3. Update existing profiles table where email matches
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE LOWER(email) = 'manorhub533@gmail.com';

-- 4. Trigger function to auto-assign admin role on registration or update for manorhub533@gmail.com
CREATE OR REPLACE FUNCTION public.auto_assign_admin_email()
RETURNS TRIGGER AS $$
BEGIN
  IF LOWER(NEW.email) = 'manorhub533@gmail.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach trigger to public.profiles BEFORE INSERT OR UPDATE
DROP TRIGGER IF EXISTS tr_auto_assign_admin_email ON public.profiles;
CREATE TRIGGER tr_auto_assign_admin_email
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_email();
