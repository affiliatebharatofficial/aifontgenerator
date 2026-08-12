import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, Binary, ShieldAlert } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'AI Font Maker — Neural Prompt-to-Vector Typography Engine',
  description:
    'Synthesize custom vector typefaces from natural language descriptions using our neural AI font maker.',
  path: '/ai-font-maker',
});

export default function AiFontMakerPage() {
  const faqs = [
    {
      question: 'How do prompts control the AI Font Maker?',
      answer:
        'The AI Font Maker parses natural language prompts for aesthetic cues (such as stroke contrast, terminal curves, serif geometry, and mood keywords) and maps them into vector glyph outlines.',
    },
    {
      question: 'Are generated fonts unique?',
      answer:
        'Yes. Because generative AI models calculate vector parameters based on your specific combination of prompt text, weight, category, and style settings, each generated font file is distinct.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'AI Font Maker', href: '/ai-font-maker' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            NEURAL PROMPT SYNTHESIS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            AI Vector Font Maker <br />
            <span className="italic text-[#a1a1aa]">From Text Prompts.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Translate creative intent into working font binaries. Describe a typographic vibe and generate fully valid OpenType vector files.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Launch AI Font Maker</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <BrainCircuit className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Prompt Intelligence</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Analyzes subtle adjectives in your text description to formulate vector glyph geometry parameters.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Binary className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Vector Glyph Math</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Calculates precise ascender, descender, baseline, and side-bearing coordinates for 75 OpenType glyphs.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <ShieldAlert className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Zero Mock Guarantee</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              We never return static placeholder images or renamed system fonts. Every download is a real binary font file.
            </p>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

      <Footer />
    </div>
  );
}
