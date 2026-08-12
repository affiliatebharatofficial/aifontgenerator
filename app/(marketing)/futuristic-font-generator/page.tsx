import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Tag, Zap } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';

export const metadata: Metadata = constructMetadata({
  title: 'Futuristic Font Generator — Cyberpunk & Sci-Fi Display Typefaces',
  description:
    'Generate sharp futuristic fonts, cyberpunk display typefaces, and sci-fi vector glyphs in TTF, OTF, and WOFF2.',
  path: '/futuristic-font-generator',
});

export default function FuturisticFontGeneratorPage() {
  const faqs = [
    {
      question: 'What character traits define a futuristic font?',
      answer:
        'Futuristic typefaces feature sharp angular joints, minimalist geometric counters, truncated crossbars, stencil cuts, and high-tech modular stem proportions.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Futuristic Font Generator', href: '/futuristic-font-generator' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            STYLE GUIDE & SYNTHESIS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Futuristic & Sci-Fi <br />
            <span className="italic text-[#a1a1aa]">Type Generator.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Craft angular, cyberpunk, and techno display typefaces for sci-fi titles, UI HUDs, and futuristic brand identities.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Build Sci-Fi Font</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Zap className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Style Characteristics</h2>
            <ul className="text-xs sm:text-sm text-[#a1a1aa] space-y-2 list-disc list-inside">
              <li>Sharp chamfered corners and 45-degree angled cuts.</li>
              <li>Minimalist enclosed counters and high-tech stencil gaps.</li>
              <li>Monospaced and wide extended display proportions.</li>
            </ul>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Tag className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Prompt Examples</h2>
            <div className="space-y-3 text-xs font-mono text-[#a1a1aa]">
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Cyberpunk neon display font with sharp 45-degree chamfered corners and stencil cut crossbars&quot;
              </div>
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Minimalist sci-fi HUD display font with wide extended proportions and square counters&quot;
              </div>
            </div>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

          </div>
  );
}
