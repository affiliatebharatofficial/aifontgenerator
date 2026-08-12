import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Custom Font Generator — Bespoke Brand & Display Typography',
  description:
    'Generate custom bespoke fonts tailored for unique brand identity systems, logotypes, packaging, and digital products.',
  path: '/custom-font-generator',
});

export default function CustomFontGeneratorPage() {
  const faqs = [
    {
      question: 'Why choose a custom font generator for brand design?',
      answer:
        'Standard stock fonts are used across thousands of websites and campaigns. Generating a bespoke custom typeface gives your brand a distinct visual identity, memorable logotypes, and signature headline styles that cannot be duplicated by off-the-shelf fonts.',
    },
    {
      question: 'Do custom generated fonts support responsive web embedding?',
      answer:
        'Yes. All custom fonts generated on our platform include optimized WOFF2 web binaries, allowing high performance, cross-browser rendering with minimal asset payloads.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Custom Font Generator', href: '/custom-font-generator' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            BESPOKE BRAND TYPOGRAPHY
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Bespoke Custom <br />
            <span className="italic text-[#a1a1aa]">Typeface Creation.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Stand out with custom display typography. Craft proprietary type personalities for logos, brand identity guidelines, and high-impact marketing collateral.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Build Custom Typeface</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Palette className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Signature Aesthetics</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Define exact visual moods — from sleek architectural sans serifs to expressive high-contrast display serifs.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Sparkles className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Original Glyph Vectors</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Synthesize 75 unique vector character outlines directly output to desktop font binaries without licensing third-party catalog fonts.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <ShieldCheck className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Production Build Standards</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Every custom font passes automated sfnt binary table checks to ensure cross-platform desktop and web stability.
            </p>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

      <Footer />
    </div>
  );
}
