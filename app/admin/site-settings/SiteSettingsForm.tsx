'use client';

import { useState } from 'react';
import { updateSiteSettingsAction } from '@/lib/admin/actions';
import { Sliders, Megaphone, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SiteSettingsForm({
  initialSiteName = 'AI Font Generator',
  initialSupportEmail = 'support@ai-fontgenerator.com',
  initialAnnouncementEnabled = false,
  initialAnnouncementMessage = '',
}: {
  initialSiteName?: string;
  initialSupportEmail?: string;
  initialAnnouncementEnabled?: boolean;
  initialAnnouncementMessage?: string;
}) {
  const [siteName, setSiteName] = useState(initialSiteName);
  const [supportEmail, setSupportEmail] = useState(initialSupportEmail);
  const [announcementEnabled, setAnnouncementEnabled] = useState(initialAnnouncementEnabled);
  const [announcementMessage, setAnnouncementMessage] = useState(initialAnnouncementMessage);

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      const res = await updateSiteSettingsAction(
        siteName,
        supportEmail,
        announcementEnabled,
        announcementMessage
      );
      if (res.success) {
        setStatus({ type: 'success', msg: res.message || 'Site settings updated.' });
      } else {
        setStatus({ type: 'error', msg: res.error || 'Failed to update settings.' });
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
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Site Identity & Contact</span>
          </CardTitle>
          <CardDescription>Configure site title, branding, and customer support contact email.</CardDescription>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Site Name</label>
              <Input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Support Email</label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-400" />
              <span>Global Announcement Bar</span>
            </CardTitle>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <span className={announcementEnabled ? 'text-indigo-400' : 'text-slate-500'}>
                {announcementEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>
          <CardDescription>
            Display a dynamic notification bar across public marketing and application headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Announcement Message</label>
            <textarea
              rows={2}
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              placeholder="e.g. New AI font generation features are now live!"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
          <Button type="submit" isLoading={isSaving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
