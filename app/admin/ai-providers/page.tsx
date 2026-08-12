import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { AIProviderCard } from './AIProviderCard';

export const metadata: Metadata = {
  title: 'AI Providers — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAIProvidersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rawProviders } = await supabase
    .from('ai_providers')
    .select('*')
    .order('priority', { ascending: true });

  const providers =
    (rawProviders as unknown as Array<{
      provider: string;
      enabled: boolean;
      model: string;
      priority: number;
      api_key_masked: string | null;
    }>) ?? [];

  const defaultProviders: Array<'openai' | 'gemini' | 'openrouter' | 'deepseek'> = [
    'openai',
    'gemini',
    'openrouter',
    'deepseek',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          AI Provider Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure model parameters, execution priority order, and run server-side connection tests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultProviders.map((pName, index) => {
          const rec = providers.find((p) => p.provider === pName);
          const isEnabled = rec !== undefined ? rec.enabled : (pName === 'openai' || pName === 'gemini');
          return (
            <AIProviderCard
              key={pName}
              provider={pName}
              enabled={isEnabled}
              model={rec?.model || (pName === 'openai' ? 'gpt-4o-mini' : pName === 'gemini' ? 'gemini-1.5-flash' : pName === 'deepseek' ? 'deepseek-chat' : 'anthropic/claude-3-haiku')}
              priority={rec?.priority ?? index + 1}
              keyMasked={rec?.api_key_masked || 'Configured via Environment Variables'}
            />
          );
        })}
      </div>
    </div>
  );
}
