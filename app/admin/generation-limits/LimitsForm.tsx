'use client';

import { useState } from 'react';
import { updateGenerationLimitsAction } from '@/lib/admin/actions';
import { Gauge, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LimitsForm({
  initialDailyLimit = 3,
  initialMaxPromptLength = 2000,
}: {
  initialDailyLimit?: number;
  initialMaxPromptLength?: number;
}) {
  const [dailyLimit, setDailyLimit] = useState(initialDailyLimit);
  const [maxPromptLength, setMaxPromptLength] = useState(initialMaxPromptLength);

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      const res = await updateGenerationLimitsAction(dailyLimit, maxPromptLength);
      if (res.success) {
        setStatus({ type: 'success', msg: res.message || 'Generation limits updated.' });
      } else {
        setStatus({ type: 'error', msg: res.error || 'Failed to update limits.' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'An error occurred.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-400" />
            <span>Generation Quotas & Thresholds</span>
          </CardTitle>
          <CardDescription>
            Control maximum daily generation allowance and prompt length validation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{status.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Daily Generations Per User
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-500">
                Quota enforced per user per calendar day (UTC).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Maximum Prompt Length (Characters)
              </label>
              <Input
                type="number"
                min="100"
                max="5000"
                value={maxPromptLength}
                onChange={(e) => setMaxPromptLength(Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-500">
                Maximum character threshold permitted in prompt submissions.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
          <Button type="submit" isLoading={isSaving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Limits</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
