import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Cursive Font Generator — Flowing Script & Calligraphic Typefaces',
  description:
    'Generate elegant cursive script fonts with continuous pen strokes, calligraphic swashes, and flowing baselines in TTF, OTF, WOFF2 or copy instant Unicode script text.',
  path: '/cursive-font-generator',
});

export default function CursiveFontGeneratorPage() {
  const faqs = [
    {
      question: 'What defines a cursive font in digital typography?',
      answer:
        'Cursive fonts mimic flowing handwriting where characters connect or entry/exit terminals align seamlessly along a continuous baseline stroke.',
    },
    {
      question: 'Can cursive generated fonts be used on commercial websites?',
      answer:
        'Yes. Our WOFF2 web binaries load efficiently on modern websites and can be used for wedding invitation headlines, luxury branding, and editorial banners.',
    },
    {
      question: 'Can I copy instant Unicode cursive text for Instagram bios?',
      answer:
        'Yes! Use our instant Fancy Font Generator section below to copy mathematical script and cursive Unicode text directly to your clipboard.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Cursive Font Generator', href: '/cursive-font-generator' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            STYLE GUIDE & SYNTHESIS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Cursive & Calligraphic <br />
            <span className="italic text-[#a1a1aa]">Script Generator.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Create flowing cursive scripts, formal copperplate calligraphy, and expressive brush lettering. Export valid TTF, OTF, and WOFF2 binaries or copy instant Unicode script text.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Synthesize Cursive Font (TTF/OTF)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Instant Unicode Cursive Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">Instant Cursive Unicode Text</h2>
            <p className="text-xs text-[#a1a1aa]">
              Transform text into mathematical script Unicode characters for instant copy and paste to Instagram, TikTok, and bios.
            </p>
          </div>
          <FancyFontGenerator initialText="Cursive Script" initialFilter="script" />
        </section>

        {/* Style Characteristics & Prompt Examples */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Sparkles className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Style Characteristics</h2>
            <ul className="text-xs sm:text-sm text-[#a1a1aa] space-y-2 list-disc list-inside">
              <li>Connected letter terminals and flowing strokes.</li>
              <li>Dynamic entry and exit swashes on capital letters.</li>
              <li>High thick-to-thin stroke contrast in nib calligraphy.</li>
              <li>Soft curved counters and graceful ascender loops.</li>
            </ul>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Tag className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Prompt Examples</h2>
            <div className="space-y-3 text-xs font-mono text-[#a1a1aa]">
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Elegant copperplate cursive script with high contrast thin hairline stems and sweeping uppercase swashes&quot;
              </div>
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded">
                &quot;Modern romantic wedding script font with smooth flowing strokes and low x-height&quot;
              </div>
            </div>
          </div>
        </section>

        <FancyVsRealFontSection />

        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
