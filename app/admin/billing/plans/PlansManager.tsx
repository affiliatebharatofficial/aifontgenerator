'use client';

import { useState } from 'react';
import {
  deleteSubscriptionPlanAction,
  toggleSubscriptionPlanActiveAction,
} from '@/lib/admin/actions';
import { PlanModal } from './PlanModal';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  HardDrive,
  Users,
  Power,
  ShieldCheck,
} from 'lucide-react';
import type { SubscriptionPlan } from '@/types/database';

interface PlansManagerProps {
  initialPlans: SubscriptionPlan[];
  subscriberCounts: Record<string, number>;
}

export function PlansManager({
  initialPlans,
  subscriberCounts,
}: PlansManagerProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    setActionLoadingId(plan.id);
    try {
      const nextStatus = !plan.is_active;
      const res = await toggleSubscriptionPlanActiveAction(plan.id, nextStatus);
      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === plan.id ? { ...p, is_active: nextStatus } : p))
        );
        showFeedback('success', res.message || 'Plan status updated.');
      } else {
        showFeedback('error', res.error || 'Failed to update plan status.');
      }
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Toggle failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    const subs = subscriberCounts[plan.id] ?? 0;
    const confirmMsg =
      subs > 0
        ? `This plan has ${subs} active subscriber(s). Deleting will deactivate the plan rather than removing it. Continue?`
        : `Are you sure you want to permanently delete plan "${plan.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(plan.id);
    try {
      const res = await deleteSubscriptionPlanAction(plan.id);
      if (res.success) {
        if (subs === 0) {
          setPlans((prev) => prev.filter((p) => p.id !== plan.id));
        } else {
          setPlans((prev) =>
            prev.map((p) => (p.id === plan.id ? { ...p, is_active: false } : p))
          );
        }
        showFeedback('success', res.message || 'Plan deleted successfully.');
      } else {
        showFeedback('error', res.error || 'Failed to delete plan.');
      }
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold">
            Configured Plans ({plans.length})
          </h2>
          <p className="text-xs text-slate-500">
            Define daily font generation quotas, pricing tiers, and storage allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const subscribers = subscriberCounts[plan.id] ?? 0;
          const isLoading = actionLoadingId === plan.id;

          return (
            <div
              key={plan.id}
              className={`border rounded-2xl p-5 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between space-y-5 transition-all ${
                plan.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-70 bg-slate-950'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-slate-100 uppercase">
                        {plan.name}
                      </h3>
                      {plan.is_default && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-950 border border-indigo-800 text-indigo-300 flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>Default</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      slug: {plan.slug}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      plan.is_active
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Price Display */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold font-mono text-slate-100">
                      ${plan.monthly_price}
                    </span>
                    <span className="text-xs text-slate-400 font-mono"> / mo</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    ${plan.yearly_price} / yr
                  </span>
                </div>

                {/* Quotas & Specs */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/50">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Daily Limit:</span>
                    </span>
                    <strong className="text-amber-400 font-bold">
                      {plan.generation_limit} gens / day
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/50">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Storage:</span>
                    </span>
                    <span className="text-slate-200">{plan.storage_limit_mb} MB</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>Subscribers:</span>
                    </span>
                    <span className="text-purple-300 font-semibold">{subscribers} users</span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(plan)}
                    disabled={isLoading}
                    className="p-2 rounded-lg text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    disabled={isLoading}
                    className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1 cursor-pointer ${
                      plan.is_active
                        ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-amber-400'
                        : 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-800 text-emerald-300'
                    }`}
                    title={plan.is_active ? 'Deactivate Plan' : 'Activate Plan'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono">
                      {plan.is_active ? 'Disable' : 'Enable'}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(plan)}
                  disabled={isLoading || plan.is_default}
                  className="p-2 rounded-lg text-xs bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title={plan.is_default ? 'Cannot delete default plan' : 'Delete Plan'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      <PlanModal
        plan={selectedPlan}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => {
          showFeedback('success', msg);
          // In Next.js Server Components, router.refresh() or server action revalidates path.
        }}
        onError={(err) => showFeedback('error', err)}
      />
    </div>
  );
}
