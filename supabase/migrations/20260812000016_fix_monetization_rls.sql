-- Fix Monetization & Entitlements RLS Policies
-- Target Tables: public.credit_balances, public.credit_transactions, public.user_subscriptions, public.user_entitlements, public.subscription_plans, public.billing_customers

-- 1. credit_balances RLS Policies
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own credit balance" ON public.credit_balances;
DROP POLICY IF EXISTS "Users insert own credit balance" ON public.credit_balances;
DROP POLICY IF EXISTS "Users update own credit balance" ON public.credit_balances;
DROP POLICY IF EXISTS "Admins manage credit balances" ON public.credit_balances;

CREATE POLICY "Users view own credit balance"
  ON public.credit_balances FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own credit balance"
  ON public.credit_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users update own credit balance"
  ON public.credit_balances FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage credit balances"
  ON public.credit_balances FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 2. credit_transactions RLS Policies
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own credit transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users insert own credit transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Admins manage credit transactions" ON public.credit_transactions;

CREATE POLICY "Users view own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own credit transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage credit transactions"
  ON public.credit_transactions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 3. user_subscriptions RLS Policies
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins manage user subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage user subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 4. user_entitlements RLS Policies
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own entitlements" ON public.user_entitlements;
DROP POLICY IF EXISTS "Admins manage entitlements" ON public.user_entitlements;

CREATE POLICY "Users view own entitlements"
  ON public.user_entitlements FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage entitlements"
  ON public.user_entitlements FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 5. subscription_plans RLS Policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins manage plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins manage plans"
  ON public.subscription_plans FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 6. billing_customers RLS Policies
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own billing customer" ON public.billing_customers;
DROP POLICY IF EXISTS "Admins manage billing customers" ON public.billing_customers;

CREATE POLICY "Users view own billing customer"
  ON public.billing_customers FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage billing customers"
  ON public.billing_customers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
