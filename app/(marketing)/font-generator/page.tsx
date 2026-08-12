import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sliders, CheckCircle2, FileType } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';

export const metadata: Metadata = constructMetadata({
  title: 'Font Generator — Custom Vector Typeface Design Suite',
  description:
    'Design custom fonts with total control over category, weight, width, and character encodings. Export valid TTF, OTF, and WOFF2 files.',
  path: '/font-generator',
});

export default function FontGeneratorPage() {
  const faqs = [
    {
      question: 'What parameters can I customize in the Font Generator?',
      answer:
        'You can configure font categories (Sans Serif, Serif, Display, Monospace), stem weights (Light to Heavy), character widths (Condensed to Expanded), visual style moods (Modern, Retro, Futuristic, Organic), and character encoding sets (Uppercase, Lowercase, Numbers, and Symbols).',
    },
    {
      question: 'How do I test my font before downloading?',
      answer:
        'Once generated, your custom font is dynamically rendered on an interactive specimen stage where you can adjust live preview text, font size, tracking, leading, alignment, and inspect individual glyph nodes.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Font Generator', href: '/font-generator' }]} />

        {/* Hero */}
        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            TYPE DESIGN CONTROLS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Custom Vector Font <br />
            <span className="italic text-[#a1a1aa]">Design Suite.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Engineered for designers and developers who need precision typography. Set exact structural parameters and compile fully functional font software.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Launch Generator Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Controls Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Sliders className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Structural Tuning</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Fine-tune stroke contrast, ascender/descender ratios, x-height, and terminal shapes across the full alphabet.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <CheckCircle2 className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Unicode Coverage</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Generate complete 75-character glyph sets including uppercase A-Z, lowercase a-z, numerals 0-9, and standard punctuation.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <FileType className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Multi-Format Output</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Receive valid OTF, TTF, and WOFF2 binaries ready to install into your operating system or deploy on production web servers.
            </p>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

          </div>
  );
}
