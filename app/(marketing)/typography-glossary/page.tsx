import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Typography Glossary — Essential Type & Font Terminology Guide',
  description:
    'Comprehensive typography glossary defining key terms including Typeface, Font, Glyph, Kerning, Tracking, Leading, Ascender, Descender, Serif, and Monospace.',
  path: '/typography-glossary',
});

interface Term {
  name: string;
  category: string;
  definition: string;
}

export default function TypographyGlossaryPage() {
  const terms: Term[] = [
    {
      name: 'Typeface',
      category: 'General Design',
      definition:
        'A cohesive family of graphic characters, letters, numerals, and punctuation sharing a consistent visual design aesthetic (e.g. Helvetica, Times New Roman).',
    },
    {
      name: 'Font',
      category: 'Technical File',
      definition:
        'The underlying digital binary software file (such as a .ttf, .otf, or .woff2 file) that implements a specific weight, style, and size of a typeface.',
    },
    {
      name: 'Glyph',
      category: 'Glyph Geometry',
      definition:
        'An individual elemental vector shape or character outline representation within a font file corresponding to a specific Unicode character code point.',
    },
    {
      name: 'Kerning',
      category: 'Metrics & Spacing',
      definition:
        'The intentional micro-adjustment of horizontal space between specific pairs of letters (e.g. "AV" or "Wa") to achieve balanced visual density.',
    },
    {
      name: 'Tracking',
      category: 'Metrics & Spacing',
      definition:
        'The overall uniform horizontal letter-spacing applied across an entire word, sentence, or block of text.',
    },
    {
      name: 'Leading',
      category: 'Metrics & Spacing',
      definition:
        'The vertical distance measured between consecutive baselines of text lines (commonly referred to as line height in CSS).',
    },
    {
      name: 'Baseline',
      category: 'Anatomy',
      definition:
        'The invisible horizontal reference line upon which most characters rest and above which ascenders extend.',
    },
    {
      name: 'Ascender',
      category: 'Anatomy',
      definition:
        'The portion of a lowercase letter (such as b, d, f, h, k, l) that extends vertically above the main x-height line.',
    },
    {
      name: 'Descender',
      category: 'Anatomy',
      definition:
        'The portion of a lowercase letter (such as g, j, p, q, y) that drops below the baseline.',
    },
    {
      name: 'X-height',
      category: 'Anatomy',
      definition:
        'The vertical height of lowercase letters that do not have ascenders or descenders, typically measured from the lowercase letter "x".',
    },
    {
      name: 'Weight',
      category: 'Parameters',
      definition:
        'The relative thickness or heaviness of character stroke stems, ranging from Ultra-Light (100) to Black/Heavy (900).',
    },
    {
      name: 'Width',
      category: 'Parameters',
      definition:
        'The horizontal proportion of glyph outlines, ranging from Ultra-Condensed (narrow stems) to Expanded (wide stems).',
    },
    {
      name: 'Serif',
      category: 'Classification',
      definition:
        'Small decorative stems or cross-strokes extending from the main vertical and horizontal strokes of letterforms.',
    },
    {
      name: 'Sans Serif',
      category: 'Classification',
      definition:
        'Typefaces designed without decorative end serifs, offering clean, modern geometric or humanist stroke terminals.',
    },
    {
      name: 'Display Font',
      category: 'Classification',
      definition:
        'Typefaces designed specifically for high-impact use at large point sizes (such as headlines, posters, and logotypes) rather than long body text.',
    },
    {
      name: 'Monospace',
      category: 'Classification',
      definition:
        'Typefaces in which every character advances by an identical horizontal width grid, commonly used in code editors and technical layouts.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        <Breadcrumbs items={[{ name: 'Typography Glossary', href: '/typography-glossary' }]} />

        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            EDUCATIONAL REFERENCE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Typography Glossary <br />
            <span className="italic text-[#a1a1aa]">& Terminology Guide.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a1a1aa] max-w-2xl font-normal">
            Essential reference definitions covering type classification, character anatomy, metric spacing, and binary font table structures.
          </p>
        </div>

        {/* Glossary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {terms.map((term) => (
            <div
              key={term.name}
              className="border border-[#27272a] bg-[#121215] p-6 rounded-md space-y-2 hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-[#f4f4f5] uppercase">{term.name}</h2>
                <span className="text-[10px] font-mono text-[#e05638] uppercase font-bold px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">
                  {term.category}
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed font-normal">{term.definition}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-8 text-center border-t border-[#27272a]">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
          >
            <span>Put Knowledge to Work — Synthesize Type</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
