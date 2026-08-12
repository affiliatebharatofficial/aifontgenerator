'use client';

import { useState } from 'react';
import { updateAdsConfigAction } from '@/lib/admin/actions';
import { Megaphone, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AdsForm({
  initialEnabled = false,
  initialPublisherId = '',
  initialHeaderSlot = '',
  initialSidebarSlot = '',
  initialFooterSlot = '',
}: {
  initialEnabled?: boolean;
  initialPublisherId?: string;
  initialHeaderSlot?: string;
  initialSidebarSlot?: string;
  initialFooterSlot?: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [publisherId, setPublisherId] = useState(initialPublisherId);
  const [headerSlot, setHeaderSlot] = useState(initialHeaderSlot);
  const [sidebarSlot, setSidebarSlot] = useState(initialSidebarSlot);
  const [footerSlot, setFooterSlot] = useState(initialFooterSlot);

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      const res = await updateAdsConfigAction(
        enabled,
        publisherId,
        headerSlot,
        sidebarSlot,
        footerSlot
      );
      if (res.success) {
        setStatus({ type: 'success', msg: res.message || 'Ads configuration saved.' });
      } else {
        setStatus({ type: 'error', msg: res.error || 'Failed to save configuration.' });
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-400" />
              <span>Google AdSense Configuration</span>
            </CardTitle>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <span className={enabled ? 'text-indigo-400' : 'text-slate-500'}>
                {enabled ? 'Ads Active' : 'Ads Disabled'}
              </span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>
          <CardDescription>
            Configure AdSense Publisher ID and ad slot placements safely without breaking typography layouts.
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

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">AdSense Publisher ID</label>
            <Input
              type="text"
              placeholder="pub-1234567890123456"
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Header Ad Slot ID</label>
              <Input
                type="text"
                placeholder="1234567890"
                value={headerSlot}
                onChange={(e) => setHeaderSlot(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Sidebar Ad Slot ID</label>
              <Input
                type="text"
                placeholder="1234567890"
                value={sidebarSlot}
                onChange={(e) => setSidebarSlot(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Footer Ad Slot ID</label>
              <Input
                type="text"
                placeholder="1234567890"
                value={footerSlot}
                onChange={(e) => setFooterSlot(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
          <Button type="submit" isLoading={isSaving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Ads Config</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
