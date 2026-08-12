'use client';

import { useState } from 'react';
import { updateMaintenanceModeAction } from '@/lib/admin/actions';
import { Wrench, CheckCircle2, AlertCircle, Save, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function MaintenanceForm({
  initialEnabled = false,
  initialMessage = 'AI Font Generator is currently undergoing scheduled maintenance. Please check back shortly.',
}: {
  initialEnabled?: boolean;
  initialMessage?: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState(initialMessage);

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      const res = await updateMaintenanceModeAction(enabled, message);
      if (res.success) {
        setStatus({ type: 'success', msg: res.message || 'Maintenance status updated.' });
      } else {
        setStatus({ type: 'error', msg: res.error || 'Failed to update status.' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'An error occurred.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className={enabled ? 'border-amber-800 bg-amber-950/20' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>System Maintenance Mode</span>
            </CardTitle>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <span className={enabled ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                {enabled ? 'Active (Maintenance Mode)' : 'Normal Operation'}
              </span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </label>
          </div>
          <CardDescription>
            When Maintenance Mode is active, public site visitors see the maintenance banner. Authenticated admins retain full access to `/admin`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {enabled && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Maintenance Mode is ON. Public users will see your maintenance message.
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Maintenance Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
          <Button
            type="submit"
            isLoading={isSaving}
            variant={enabled ? 'danger' : 'primary'}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Maintenance Status</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
