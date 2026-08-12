import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { getSiteSetting } from '@/lib/admin/settings-service';
import { Globe, Save } from 'lucide-react';
import { updateHomepageSettingsAction } from '@/lib/admin/settings-actions';

export const metadata: Metadata = {
  title: 'Homepage Content CMS — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminHomepageSettingsPage() {
  await requireAdmin();

  const siteName = await getSiteSetting<string>('site_name', 'AI Font Generator');
  const heroEyebrow = await getSiteSetting<string>('hero_eyebrow', 'NEXT-GENERATION TYPOGRAPHY ENGINE');
  const heroTitle = await getSiteSetting<string>('hero_title', 'CREATE BESPOKE TYPEFACES WITH ARTIFICIAL INTELLIGENCE');
  const heroDescription = await getSiteSetting<string>('hero_description', 'Transform textual descriptions into complete production-ready OpenType and TrueType font binaries in seconds.');
  const primaryCtaLabel = await getSiteSetting<string>('primary_cta_label', 'Start Generating');
  const primaryCtaUrl = await getSiteSetting<string>('primary_cta_url', '/generate');

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <Globe className="w-3.5 h-3.5" />
          <span>STRUCTURED HOMEPAGE CMS</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          HOMEPAGE CONTENT CONTROL
        </h1>
        <p className="text-xs text-slate-400">
          Edit structured homepage hero copy and call-to-action buttons without touching source code.
        </p>
      </div>

      <form
        action={async (formData: FormData) => {
          'use server';
          await updateHomepageSettingsAction(formData);
        }}
        className="space-y-6 border border-slate-800 bg-slate-900 rounded-2xl p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Site Brand Name
            </label>
            <input
              type="text"
              name="site_name"
              defaultValue={siteName}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Hero Eyebrow Text
            </label>
            <input
              type="text"
              name="hero_eyebrow"
              defaultValue={heroEyebrow}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Hero Main H1 Title
            </label>
            <textarea
              name="hero_title"
              defaultValue={heroTitle}
              rows={2}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-400 font-bold uppercase text-[10px]">
              Hero Subtitle / Description Paragraph
            </label>
            <textarea
              name="hero_description"
              defaultValue={heroDescription}
              rows={3}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">
                Primary CTA Button Label
              </label>
              <input
                type="text"
                name="primary_cta_label"
                defaultValue={primaryCtaLabel}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold text-xs outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-400 font-bold uppercase text-[10px]">
                Primary CTA Destination Route
              </label>
              <input
                type="text"
                name="primary_cta_url"
                defaultValue={primaryCtaUrl}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Homepage Content</span>
          </button>
        </div>
      </form>
    </div>
  );
}
