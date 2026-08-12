import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';

export const metadata: Metadata = constructMetadata({
  title: 'How It Works — 5-Step Vector Type Synthesis Architecture',
  description:
    'Explore our 5-step vector font generation process: Describe, Configure, Generate, Validate, and Download TTF/OTF/WOFF2 font binaries.',
  path: '/how-it-works',
});

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'DESCRIBE',
      desc: 'Provide a natural language text prompt detailing the visual aesthetic, stroke contrast, terminal shape, and emotional mood of your desired typeface.',
    },
    {
      num: '02',
      title: 'CONFIGURE',
      desc: 'Select baseline font category (Serif, Sans Serif, Display, Monospace), stem weight, character width, style direction, and target Unicode encodings.',
    },
    {
      num: '03',
      title: 'GENERATE',
      desc: 'Our AI Provider Engine processes your parameters through dynamic vector generation pipelines, outputting 75 OpenType cubic Bezier glyph outlines.',
    },
    {
      num: '04',
      title: 'VALIDATE',
      desc: 'Inspect the compiled typeface on an interactive specimen stage. Adjust font size, tracking, leading, line height, and verify individual character nodes.',
    },
    {
      num: '05',
      title: 'DOWNLOAD',
      desc: 'Download valid production font binaries: TrueType (.ttf), OpenType (.otf), and compressed Web (.woff2) files ready for immediate desktop and web deployment.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'How It Works', href: '/how-it-works' }]} />

        {/* Title */}
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            PROCESS ARCHITECTURE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            HOW TYPE IS <br />
            <span className="italic text-[#a1a1aa]">SYNTHESIZED.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a1a1aa] max-w-2xl">
            Our engine translates creative text parameters directly into mathematically valid OpenType sfnt binary font software.
          </p>
        </div>

        {/* 5-Step Process */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="border border-[#27272a] bg-[#121215] rounded-md p-8 sm:p-10 space-y-4 transition-colors hover:border-[#3f3f46]"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="text-3xl sm:text-5xl font-bold text-[#e05638]">{step.num}</span>
                <span className="text-xs text-[#71717a] uppercase font-bold tracking-widest">
                  STEP {step.num}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-[#f4f4f5] uppercase">
                {step.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-8 text-center">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
          >
            <span>Start Creating Your Typeface</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

          </div>
  );
}
