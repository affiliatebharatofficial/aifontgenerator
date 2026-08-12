import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { getAllFeatureFlags } from '@/lib/admin/settings-service';
import { Layers } from 'lucide-react';
import { toggleFeatureFlagAction } from '@/lib/admin/settings-actions';

export const metadata: Metadata = {
  title: 'Feature Control — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminFeaturesPage() {
  await requireAdmin();

  const flags = await getAllFeatureFlags();

  // Core feature definitions with safe defaults if table is empty
  const defaultFeatures = [
    { key: 'ai_font_generation', label: 'AI Font Generation Engine', desc: 'Allows users to create fonts from text prompts (/generate)' },
    { key: 'handwriting_to_font', label: 'Handwriting to Font Generator', desc: 'Allows users to convert handwriting samples to fonts (/handwriting-to-font)' },
    { key: 'font_import', label: 'Private Font Importer', desc: 'Allows users to upload and inspect font binaries (/import-font)' },
    { key: 'font_testing_studio', label: 'Font Testing Studio', desc: 'Enables typography specimen testing canvas (/font/[id]/test)' },
    { key: 'font_versioning', label: 'Font Versioning & Regeneration', desc: 'Enables creation of versions V1, V2, V3...' },
    { key: 'font_library', label: 'Font Library Workspace', desc: 'Organizes user fonts in collections and tags (/dashboard/library)' },
    { key: 'font_downloads', label: 'Font Binary Downloads', desc: 'Global toggle for raw font binary file downloads' },
    { key: 'format_ttf', label: 'TTF Binary Output', desc: 'Enables TrueType (.ttf) format generation and download' },
    { key: 'format_otf', label: 'OTF Binary Output', desc: 'Enables OpenType (.otf) format generation and download' },
    { key: 'format_woff2', label: 'WOFF2 Web Output', desc: 'Enables WOFF2 (.woff2) web font generation and download' },
    { key: 'google_login', label: 'Google OAuth Login', desc: 'Enables Google Sign-In button on login/signup forms' },
  ];

  const flagMap = new Map(flags.map((f) => [f.key, f.enabled]));

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <Layers className="w-3.5 h-3.5" />
          <span>FEATURE TOGGLES</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          FEATURE CONTROL CENTER
        </h1>
        <p className="text-xs text-slate-400">
          Toggles control both frontend UI availability and server-side access enforcement.
        </p>
      </div>

      <div className="space-y-4">
        {defaultFeatures.map((feat) => {
          const isEnabled = flagMap.get(feat.key) ?? true;
          return (
            <div
              key={feat.key}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm uppercase">{feat.label}</span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    key: {feat.key}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{feat.desc}</p>
              </div>

              <form
                action={async () => {
                  'use server';
                  await toggleFeatureFlagAction(feat.key, !isEnabled);
                }}
              >
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isEnabled
                      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300 hover:bg-emerald-900/80'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {isEnabled ? '● ENABLED' : '○ DISABLED'}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
