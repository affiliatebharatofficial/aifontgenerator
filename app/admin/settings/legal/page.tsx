import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal Pages CMS — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminLegalSettingsPage() {
  await requireAdmin();

  const legalPages = [
    { title: 'Privacy Policy', path: '/privacy', desc: 'User privacy disclosure, data processing policies, and GDPR notes.' },
    { title: 'Terms of Service', path: '/terms', desc: 'Acceptable use terms, generation rules, and service agreements.' },
    { title: 'Disclaimer', path: '/disclaimer', desc: 'Trademark disclaimers, AI generation accuracy notes, and output guarantees.' },
    { title: 'Cookie Policy', path: '/cookie-policy', desc: 'Essential cookies, analytics disclosures, and local storage usage notes.' },
  ];

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300 max-w-4xl">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <FileText className="w-3.5 h-3.5" />
          <span>LEGAL DOCUMENTATION</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          LEGAL CONTENT MANAGEMENT
        </h1>
        <p className="text-xs text-slate-400">
          Inspect and review live legal disclosure documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {legalPages.map((page) => (
          <div key={page.path} className="p-6 rounded-2xl border border-slate-800 bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 uppercase text-sm">{page.title}</h3>
              <Link
                href={page.path}
                target="_blank"
                className="text-[10px] text-rose-400 hover:underline font-bold uppercase"
              >
                View Live Page
              </Link>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{page.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
