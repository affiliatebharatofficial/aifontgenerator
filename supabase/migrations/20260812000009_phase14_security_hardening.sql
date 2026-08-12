-- AI Font Generator Phase 14 Security Hardening Migration
-- 1. Role Escalation Prevention
-- 2. Last Administrator Protection
-- 3. Strict Admin-Only RLS Policies
-- 4. Atomic Usage Counter Function

-- 1. Function & Trigger: Prevent Non-Admins From Changing User Roles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Role escalation denied. Only administrators can modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trigger_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 2. Function & Trigger: Prevent Demoting or Deleting the Sole Administrator
CREATE OR REPLACE FUNCTION public.prevent_last_admin_demotion()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role IS DISTINCT FROM 'admin')
     OR (TG_OP = 'DELETE' AND OLD.role = 'admin') THEN
    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Operation denied. At least one active administrator must remain in the system.';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prevent_last_admin_demotion ON public.profiles;
CREATE TRIGGER trigger_prevent_last_admin_demotion
  BEFORE UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_demotion();

-- 3. Restrict Admin Tables (ai_providers, admin_activity_logs) RLS Policies
DROP POLICY IF EXISTS "Admins can manage ai_providers" ON public.ai_providers;
CREATE POLICY "Strict admin-only ai_providers access"
  ON public.ai_providers
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admin_activity_logs" ON public.admin_activity_logs;
CREATE POLICY "Strict admin-only admin_activity_logs access"
  ON public.admin_activity_logs
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Function: Atomic Daily Generation Quota Counter
CREATE OR REPLACE FUNCTION public.increment_daily_usage(
  p_user_id UUID,
  p_usage_date DATE,
  p_daily_limit INTEGER
)
RETURNS TABLE (success BOOLEAN, current_count INTEGER, is_limit_reached BOOLEAN) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert initial usage or update atomically
  INSERT INTO public.generation_usage (user_id, usage_date, generation_count, created_at, updated_at)
  VALUES (p_user_id, p_usage_date, 1, timezone('utc'::text, now()), timezone('utc'::text, now()))
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    generation_count = CASE
      WHEN generation_usage.generation_count < p_daily_limit THEN generation_usage.generation_count + 1
      ELSE generation_usage.generation_count
    END,
    updated_at = timezone('utc'::text, now())
  RETURNING generation_usage.generation_count INTO v_count;

  IF v_count <= p_daily_limit THEN
    RETURN QUERY SELECT true, v_count, (v_count >= p_daily_limit);
  ELSE
    RETURN QUERY SELECT false, v_count, true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
