import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Pen, Tag } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';

export const metadata: Metadata = constructMetadata({
  title: 'Handwritten Font Generator — Casual & Pen-Stroke Typefaces',
  description:
    'Synthesize casual handwritten fonts, pen-stroke print letterforms, and organic note-taking typefaces in TTF, OTF, and WOFF2 formats.',
  path: '/handwritten-font-generator',
});

export default function HandwrittenFontGeneratorPage() {
  const faqs = [
    {
      question: 'What is the difference between handwritten and cursive fonts?',
      answer:
        'Handwritten fonts include both un-connected print lettering (like casual ballpoint notes or architectural block printing) and connected cursive scripts, whereas cursive fonts strictly focus on flowing connected strokes.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Handwritten Font Generator', href: '/handwritten-font-generator' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            STYLE GUIDE & SYNTHESIS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Handwritten & Pen <br />
            <span className="italic text-[#a1a1aa]">Stroke Font Suite.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Generate casual, organic handwritten print typefaces for editorial notes, informal branding, and graphic design overlays.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Create Handwritten Font</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Pen className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Style Characteristics</h2>
            <ul className="text-xs sm:text-sm text-[#a1a1aa] space-y-2 list-disc list-inside">
              <li>Organic stroke variation and natural hand-drawn feel.</li>
              <li>Slight baseline shifts and expressive glyph proportions.</li>
              <li>Ballpoint, felt-tip marker, and pencil texture parameters.</li>
            </ul>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Tag className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Prompt Examples</h2>
            <div className="space-y-3 text-xs font-mono text-[#a1a1aa]">
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Casual quick ballpoint pen handwritten print with subtle baseline rhythm&quot;
              </div>
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Architectural block print handwriting font with sharp clean strokes and uniform width&quot;
              </div>
            </div>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

          </div>
  );
}
