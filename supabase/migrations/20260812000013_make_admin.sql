-- AI Font Generator Admin Assignment Migration
-- Automatically sets and enforces admin role for manorhub533@gmail.com

-- 1. Update existing profile record if present
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE LOWER(email) = 'manorhub533@gmail.com';

-- 2. Trigger function to auto-assign admin role on registration or update for manorhub533@gmail.com
CREATE OR REPLACE FUNCTION public.auto_assign_admin_email()
RETURNS TRIGGER AS $$
BEGIN
  IF LOWER(NEW.email) = 'manorhub533@gmail.com' THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to public.profiles BEFORE INSERT OR UPDATE
DROP TRIGGER IF EXISTS tr_auto_assign_admin_email ON public.profiles;
CREATE TRIGGER tr_auto_assign_admin_email
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_email();
