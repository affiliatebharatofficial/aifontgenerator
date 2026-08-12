'use client';

import { useState } from 'react';
import { updateSEOConfigAction } from '@/lib/admin/actions';
import { Search, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SEOForm({
  initialTitle = 'AI Font Generator — Create Custom Fonts with Artificial Intelligence',
  initialDescription = 'Generate real custom vector fonts using AI. Export TTF, OTF, and WOFF2 font files directly from text prompts.',
  initialCanonical = 'https://ai-fontgenerator.com',
}: {
  initialTitle?: string;
  initialDescription?: string;
  initialCanonical?: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [canonical, setCanonical] = useState(initialCanonical);

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      const res = await updateSEOConfigAction(title, description, canonical);
      if (res.success) {
        setStatus({ type: 'success', msg: res.message || 'SEO configuration saved.' });
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
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Search Engine Optimization & Social Sharing Tags</span>
          </CardTitle>
          <CardDescription>
            Configure default site title tags, meta descriptions, and canonical URL structure.
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
            <label className="block text-xs font-medium text-slate-300">Default Meta Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Meta Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Canonical Domain Host</label>
            <Input
              type="url"
              value={canonical}
              onChange={(e) => setCanonical(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
          <Button type="submit" isLoading={isSaving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save SEO Tags</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
