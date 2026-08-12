'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAIProviderAction, testAIProviderConnectionAction } from '@/lib/admin/actions';
import { Cpu, CheckCircle2, AlertCircle, Save, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AIProviderCard({
  provider,
  enabled: initialEnabled,
  model: initialModel,
  priority: initialPriority,
  keyMasked: initialKeyMasked,
}: {
  provider: 'openai' | 'gemini' | 'openrouter' | 'deepseek';
  enabled: boolean;
  model: string;
  priority: number;
  keyMasked: string;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [model, setModel] = useState(initialModel);
  const [priority, setPriority] = useState(initialPriority);
  const [maskedKey, setMaskedKey] = useState(initialKeyMasked);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus(null);
    setIsSaving(true);

    try {
      const res = await updateAIProviderAction(provider, enabled, model, priority, maskedKey);
      if (res.success) {
        setSaveStatus({ type: 'success', msg: res.message || 'Provider configuration saved.' });
        router.refresh();
      } else {
        setSaveStatus({ type: 'error', msg: res.error || 'Failed to save configuration.' });
      }
    } catch {
      setSaveStatus({ type: 'error', msg: 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTestConnection() {
    setTestResult(null);
    setIsTesting(true);

    try {
      const res = await testAIProviderConnectionAction(provider, model);
      if (res.success) {
        setTestResult({ type: 'success', msg: res.message || 'Provider connection verified!' });
      } else {
        setTestResult({ type: 'error', msg: res.error || 'Connection failed.' });
      }
    } catch {
      setTestResult({ type: 'error', msg: 'Connection test failed.' });
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold uppercase tracking-wider font-mono flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-indigo-400" />
            <span>{provider}</span>
          </CardTitle>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <span className={enabled ? 'text-emerald-400' : 'text-slate-500'}>
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </label>
        </div>
        <CardDescription>Configure AI model identifier and provider execution priority.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          {saveStatus && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                saveStatus.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
            >
              {saveStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{saveStatus.msg}</span>
            </div>
          )}

          {/* Model Identifier */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Model Identifier</label>
            <Input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gpt-4o-mini"
            />
          </div>

          {/* Priority & Masked API Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Execution Priority</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">API Key Masked</label>
              <Input
                type="text"
                value={maskedKey}
                onChange={(e) => setMaskedKey(e.target.value)}
                placeholder="••••••••abcd"
              />
            </div>
          </div>

          {/* Connection Test Output */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                testResult.type === 'success'
                  ? 'bg-indigo-950/70 border-indigo-800 text-indigo-300'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{testResult.msg}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            isLoading={isTesting}
            className="flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Connection</span>
          </Button>

          <Button type="submit" size="sm" isLoading={isSaving} className="flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
