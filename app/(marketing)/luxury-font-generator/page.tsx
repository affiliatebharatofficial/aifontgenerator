import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Crown, Tag } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Luxury Font Generator — High-Contrast Fashion & Editorial Serifs',
  description:
    'Generate high-contrast luxury serif fonts, fashion editorial headlines, and refined brand typography in TTF, OTF, and WOFF2 formats.',
  path: '/luxury-font-generator',
});

export default function LuxuryFontGeneratorPage() {
  const faqs = [
    {
      question: 'What defines high-end luxury typography?',
      answer:
        'Luxury fonts feature refined proportions, extreme stroke contrast (ultra-thin hairline strokes paired with rich dark stems), delicate bracketing, and crisp geometric serifs reminiscent of high-fashion magazines and luxury house branding.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Luxury Font Generator', href: '/luxury-font-generator' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            STYLE GUIDE & SYNTHESIS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Luxury & Fashion <br />
            <span className="italic text-[#a1a1aa]">Serif Generator.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Synthesize high-contrast Didone serifs, elegant editorial headlines, and refined logotype fonts for fashion houses and premium brands.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Build Luxury Font</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Crown className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Style Characteristics</h2>
            <ul className="text-xs sm:text-sm text-[#a1a1aa] space-y-2 list-disc list-inside">
              <li>Extreme stroke contrast with ultra-thin hairline serifs.</li>
              <li>Vertical stress axes and sharp geometric Didone proportion.</li>
              <li>Generous tracking and elegant, open counter spaces.</li>
            </ul>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Tag className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Prompt Examples</h2>
            <div className="space-y-3 text-xs font-mono text-[#a1a1aa]">
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;High-fashion editorial Didone serif with extreme stroke contrast and delicate hairline serifs&quot;
              </div>
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Modern luxury brand display serif with vertical stress and refined capital proportions&quot;
              </div>
            </div>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

      <Footer />
    </div>
  );
}
