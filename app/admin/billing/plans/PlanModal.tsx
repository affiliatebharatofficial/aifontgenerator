'use client';

import { useState } from 'react';
import {
  createSubscriptionPlanAction,
  updateSubscriptionPlanAction,
} from '@/lib/admin/actions';
import { X, Save, Plus } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/database';

interface PlanModalProps {
  plan?: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (err: string) => void;
}

export function PlanModal({
  plan,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: PlanModalProps) {
  const isEdit = !!plan;

  const [name, setName] = useState(plan?.name || '');
  const [slug, setSlug] = useState(plan?.slug || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [monthlyPrice, setMonthlyPrice] = useState(String(plan?.monthly_price ?? 0));
  const [yearlyPrice, setYearlyPrice] = useState(String(plan?.yearly_price ?? 0));
  const [currency, setCurrency] = useState(plan?.currency || 'USD');
  const [generationLimit, setGenerationLimit] = useState(String(plan?.generation_limit ?? 10));
  const [storageLimitMb, setStorageLimitMb] = useState(String(plan?.storage_limit_mb ?? 100));
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [isDefault, setIsDefault] = useState(plan?.is_default ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    if (isEdit && plan) {
      formData.append('id', plan.id);
    }
    formData.append('name', name.trim());
    formData.append('slug', slug.trim().toLowerCase());
    formData.append('description', description.trim());
    formData.append('monthly_price', monthlyPrice);
    formData.append('yearly_price', yearlyPrice);
    formData.append('currency', currency);
    formData.append('generation_limit', generationLimit);
    formData.append('storage_limit_mb', storageLimitMb);
    formData.append('is_active', String(isActive));
    formData.append('is_default', String(isDefault));

    try {
      const res = isEdit
        ? await updateSubscriptionPlanAction(formData)
        : await createSubscriptionPlanAction(formData);

      if (res.success) {
        onSuccess(res.message || (isEdit ? 'Plan updated successfully.' : 'Plan created successfully.'));
        onClose();
      } else {
        onError(res.error || 'Failed to save plan.');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase font-display">
              {isEdit ? `Edit Plan: ${plan.name}` : 'Create New Subscription Plan'}
            </h2>
            <p className="text-xs text-slate-400">
              Configure pricing, daily generation quotas, and storage limits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 block font-semibold">Plan Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEdit && !slug) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Pro Studio Plan"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 block font-semibold">Plan Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                disabled={isEdit}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. pro-studio"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 block font-semibold">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              placeholder="Summary of plan entitlements and features..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 block font-semibold">Monthly Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 block font-semibold">Yearly Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 block font-semibold">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 block font-semibold">
                Daily Generation Limit (Gens/Day) *
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                value={generationLimit}
                onChange={(e) => setGenerationLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
              <span className="text-[10px] text-slate-500">
                Number of AI font generation jobs allowed per day.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 block font-semibold">Storage Limit (MB) *</label>
              <input
                type="number"
                min="1"
                value={storageLimitMb}
                onChange={(e) => setStorageLimitMb(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
              <span className="text-[10px] text-slate-500">
                Font file asset storage allocation in megabytes.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
              />
              <span className="text-slate-200">Plan Is Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
              />
              <span className="text-slate-200">Default Registration Plan</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {isEdit ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
