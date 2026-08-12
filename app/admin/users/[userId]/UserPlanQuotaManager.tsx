'use client';

import { useState } from 'react';
import {
  adminSetUserLimitOverrideAction,
  adminAssignUserPlanAction,
  adminAdjustUserCreditBalanceAction,
} from '@/lib/admin/actions';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Zap,
  CreditCard,
  Coins,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import type { SubscriptionPlan, UserEntitlementOverride } from '@/types/database';

interface UserPlanQuotaManagerProps {
  userId: string;
  userEmail: string;
  currentPlan: SubscriptionPlan | null;
  currentOverride: UserEntitlementOverride | null;
  dailyUsage: { count: number; limit: number; isLimitReached: boolean };
  availablePlans: SubscriptionPlan[];
  creditBalance: number;
}

export function UserPlanQuotaManager({
  userId,
  userEmail,
  currentPlan,
  currentOverride,
  dailyUsage,
  availablePlans,
  creditBalance,
}: UserPlanQuotaManagerProps) {
  // Plan assignment state
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    currentPlan?.id || (availablePlans.find((p) => p.is_default)?.id ?? availablePlans[0]?.id ?? '')
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  // Quota override state
  const [customLimit, setCustomLimit] = useState<string>(
    currentOverride?.limit_override !== undefined && currentOverride?.limit_override !== null
      ? String(currentOverride.limit_override)
      : String(dailyUsage.limit)
  );
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  // Credits adjustment state
  const [creditAmount, setCreditAmount] = useState<string>('10');
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);

  // Feedback notifications
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // 1. Handle Plan Upgrade / Change
  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setIsUpdatingPlan(true);
    try {
      const res = await adminAssignUserPlanAction(userId, selectedPlanId, subscriptionStatus);
      if (res.success) {
        showFeedback('success', res.message || 'Subscription plan assigned successfully.');
      } else {
        showFeedback('error', res.error || 'Failed to update user plan.');
      }
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Plan assignment failed.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // 2. Handle Custom Limit Adjustment (Increase / Decrease)
  const handleSetLimitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseInt(customLimit, 10);
    if (isNaN(limitNum) || limitNum < 0) {
      showFeedback('error', 'Please enter a valid non-negative number for daily limit.');
      return;
    }

    setIsUpdatingLimit(true);
    try {
      const res = await adminSetUserLimitOverrideAction(
        userId,
        limitNum,
        overrideReason || `Admin manual override to ${limitNum}/day`
      );
      if (res.success) {
        showFeedback('success', res.message || 'Daily generation limit updated.');
      } else {
        showFeedback('error', res.error || 'Failed to update daily limit.');
      }
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Limit override failed.');
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  // 3. Reset Limit to Plan Default
  const handleResetLimit = async () => {
    setIsUpdatingLimit(true);
    try {
      const res = await adminSetUserLimitOverrideAction(userId, null, 'Reset to plan default');
      if (res.success) {
        showFeedback('success', 'Reset generation limit to plan default.');
        if (currentPlan) {
          setCustomLimit(String(currentPlan.generation_limit));
        }
      } else {
        showFeedback('error', res.error || 'Failed to reset limit.');
      }
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  // 4. Handle Credit Balance Adjustment
  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(creditAmount, 10);
    if (isNaN(amountNum) || amountNum === 0) {
      showFeedback('error', 'Please enter a valid non-zero credit amount.');
      return;
    }

    setIsUpdatingCredits(true);
    try {
      const res = await adminAdjustUserCreditBalanceAction(
        userId,
        amountNum,
        amountNum > 0 ? 'grant' : 'adjustment',
        `Admin adjusted ${amountNum > 0 ? '+' : ''}${amountNum} credits`
      );
      if (res.success) {
        showFeedback('success', res.message || 'Credit balance updated.');
      } else {
        showFeedback('error', res.error || 'Failed to adjust credits.');
      }
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Credit adjustment failed.');
    } finally {
      setIsUpdatingCredits(false);
    }
  };

  const hasActiveOverride =
    currentOverride?.limit_override !== undefined && currentOverride?.limit_override !== null;

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {message && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Quota & Plan Status Header Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Plan Card */}
        <Card className="p-4 bg-slate-950 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Assigned Plan</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-slate-100 mt-1 uppercase font-display">
            {currentPlan?.name || 'Default Free'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            Plan limit: {currentPlan?.generation_limit ?? 10} / day
          </span>
        </Card>

        {/* Effective Quota Card */}
        <Card className="p-4 bg-slate-950 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Effective Daily Limit</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-amber-400 font-mono">{dailyUsage.limit}</p>
            <span className="text-xs text-slate-400 font-mono">/ day</span>
          </div>
          <span className="text-[10px] font-mono block">
            {hasActiveOverride ? (
              <span className="text-emerald-400 font-semibold">Custom Admin Override Active</span>
            ) : (
              <span className="text-slate-500">Inherited from Plan</span>
            )}
          </span>
        </Card>

        {/* Today's Usage Card */}
        <Card className="p-4 bg-slate-950 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Today&apos;s Usage</span>
            <Coins className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-100 font-mono">
              {dailyUsage.count} <span className="text-xs text-slate-400">/ {dailyUsage.limit}</span>
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {dailyUsage.isLimitReached ? (
              <span className="text-rose-400 font-bold">Quota Reached</span>
            ) : (
              `${Math.max(0, dailyUsage.limit - dailyUsage.count)} generations left today`
            )}
          </span>
        </Card>
      </div>

      {/* Action 1: Adjust Generation Limit (Increase / Decrease) */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-100">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Increase or Decrease Generation Limit</span>
          </CardTitle>
          <CardDescription>
            Override the daily font generation quota for {userEmail}. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetLimitOverride} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">
                  Daily Generation Limit (Generations / Day)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={customLimit}
                    onChange={(e) => setCustomLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. 50"
                    required
                  />
                  {/* Preset Quick Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCustomLimit('25')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded"
                    >
                      25
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomLimit('50')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded"
                    >
                      50
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomLimit('100')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded"
                    >
                      100
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">
                  Override Reason / Audit Note (Optional)
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Granted bonus quota for beta test"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isUpdatingLimit}
                  className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-slate-950 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isUpdatingLimit ? 'Saving...' : 'Save Limit Override'}</span>
                </button>

                {hasActiveOverride && (
                  <button
                    type="button"
                    onClick={handleResetLimit}
                    disabled={isUpdatingLimit}
                    className="px-3 py-2 rounded-lg text-xs font-mono font-semibold text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Plan Default</span>
                  </button>
                )}
              </div>

              {hasActiveOverride && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Custom override is active ({currentOverride.limit_override}/day)
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Action 2: Upgrade / Assign Subscription Plan */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-100">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Upgrade / Assign Subscription Plan</span>
          </CardTitle>
          <CardDescription>
            Change the user&apos;s active membership plan or manually upgrade account tier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignPlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">Select Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} (${plan.monthly_price}/mo) — {plan.generation_limit} gens/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 block">Subscription Status</label>
                <select
                  value={subscriptionStatus}
                  onChange={(e) => setSubscriptionStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isUpdatingPlan || availablePlans.length === 0}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{isUpdatingPlan ? 'Assigning...' : 'Assign / Upgrade Plan'}</span>
              </button>

              <span className="text-[10px] font-mono text-slate-500">
                Grants instant access to the plan&apos;s quotas and storage limits.
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Action 3: Adjust Credit Balance */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-100">
            <Coins className="w-4 h-4 text-purple-400" />
            <span>Credit Balance & Bonus Quota</span>
          </CardTitle>
          <CardDescription>
            Current Balance: <strong className="text-purple-300 font-mono">{creditBalance} credits</strong>. Add or deduct one-time generation credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdjustCredits} className="flex flex-wrap items-center gap-3">
            <div className="w-36">
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="+/- Amount"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingCredits}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{isUpdatingCredits ? 'Updating...' : 'Adjust Credits'}</span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
