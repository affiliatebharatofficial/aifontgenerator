import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Gamepad2, Tag } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';

export const metadata: Metadata = constructMetadata({
  title: 'Gaming Font Generator — Arcade, Esports & Action Display Typefaces',
  description:
    'Generate bold gaming fonts for esports logos, arcade UI titles, action game covers, and streaming overlays in TTF, OTF, and WOFF2.',
  path: '/gaming-font-generator',
});

export default function GamingFontGeneratorPage() {
  const faqs = [
    {
      question: 'What makes a font suitable for gaming UI and titles?',
      answer:
        'Gaming fonts prioritize high legibility at large sizes, bold heavy stroke weights, sharp aggressive bevels, and distinct character silhouettes suited for game logos and HUD banners.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Gaming Font Generator', href: '/gaming-font-generator' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            STYLE GUIDE & SYNTHESIS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Gaming & Esports <br />
            <span className="italic text-[#a1a1aa]">Font Generator.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Synthesize high-impact display fonts for esports teams, retro arcade titles, action game overlays, and streaming graphics.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Build Gaming Font</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Gamepad2 className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Style Characteristics</h2>
            <ul className="text-xs sm:text-sm text-[#a1a1aa] space-y-2 list-disc list-inside">
              <li>Heavy black/ultra-bold stem weights.</li>
              <li>Sharp angular serifs and aggressive bevel angles.</li>
              <li>Pixel-grid or high-contrast speed slant geometry.</li>
            </ul>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Tag className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Prompt Examples</h2>
            <div className="space-y-3 text-xs font-mono text-[#a1a1aa]">
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Aggressive heavy esports display font with sharp angular spikes and forward motion slant&quot;
              </div>
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Retro 80s arcade block font with bold 3D bevel stroke outlines&quot;
              </div>
            </div>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

          </div>
  );
}
