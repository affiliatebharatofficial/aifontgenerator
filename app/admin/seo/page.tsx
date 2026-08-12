import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { SEOForm } from './SEOForm';

export const metadata: Metadata = {
  title: 'SEO Settings — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSEOPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: settingRecord } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'seo_config')
    .single();

  const value = (settingRecord?.value as Record<string, unknown> | null) ?? {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          SEO & Metadata Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage search engine index tags, meta descriptions, and canonical URL hosts.
        </p>
      </div>

      <SEOForm
        initialTitle={String(value.title || 'AI Font Generator — Create Custom Fonts with Artificial Intelligence')}
        initialDescription={String(value.description || 'Generate real custom vector fonts using AI. Export TTF, OTF, and WOFF2 font files directly from text prompts.')}
        initialCanonical={String(value.canonical || 'https://ai-fontgenerator.com')}
      />
    </div>
  );
}
