import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Wrench, Package, Terminal } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Font Maker — Vector Type Synthesis Studio for Designers',
  description:
    'Create custom downloadable vector fonts using our automated font maker studio. Synthesize TTF, OTF, and WOFF2 files directly from text prompts.',
  path: '/font-maker',
});

export default function FontMakerPage() {
  const faqs = [
    {
      question: 'What makes this Font Maker different from generic font editors?',
      answer:
        'Instead of requiring hours of manual Bezier node placing and font kerning calculations in desktop font editors, our generative vector engine compiles complete, mathematically valid OpenType fonts automatically from high-level prompt parameters.',
    },
    {
      question: 'Which software programs support files created with this Font Maker?',
      answer:
        'Generated .ttf and .otf font files can be installed on Windows and macOS system fonts directories and imported into Adobe Photoshop, Illustrator, InDesign, Figma, Canva, Microsoft Word, and video editors.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Font Maker', href: '/font-maker' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            DESIGNER WORKFLOW STUDIO
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Vector Type Maker <br />
            <span className="italic text-[#a1a1aa]">For Digital Creators.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Accelerate your creative workflow. Rapidly prototype and compile real OpenType font files without spending months in desktop font software.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Open Font Maker Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Wrench className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Rapid Prototyping</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Generate fully realized font specimens in seconds to test design directions with clients before committing to extensive production.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Package className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Complete File Suite</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Export standard TrueType, OpenType, and WOFF2 web binaries packaged in a single downloadable zip file.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Terminal className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Validated sfnt Tables</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Compiled font binaries feature valid head, hhea, maxp, and cmap Unicode mapping tables built with fontkit architecture.
            </p>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

      <Footer />
    </div>
  );
}
