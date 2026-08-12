import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  PenTool,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Typography Discovery & Educational Guides — AI Font Generator',
  description:
    'Explore font classifications, typography guides, design principles, and AI prompt engineering tips for sans serif, serif, display, handwritten, and monospace fonts.',
  keywords: [
    'typography discovery',
    'font categories guide',
    'sans serif vs serif',
    'font design guide',
    'ai font prompting',
  ],
};

const CATEGORIES = [
  {
    slug: 'sans-serif',
    name: 'Sans Serif',
    description: 'Clean, modern, geometric, or humanist typefaces without terminal serifs.',
    uses: 'Digital UI, modern branding, tech websites, signage',
  },
  {
    slug: 'serif',
    name: 'Serif',
    description: 'Classic, editorial, and elegant typefaces with decorative stroke terminals.',
    uses: 'Books, editorial design, luxury brands, formal publishing',
  },
  {
    slug: 'display',
    name: 'Display',
    description: 'Expressive, bold, and high-contrast headlines designed to command attention.',
    uses: 'Posters, headlines, logos, album art, hero section titles',
  },
  {
    slug: 'handwritten',
    name: 'Handwritten',
    description: 'Personal, organic, and custom brush or pen stroke letterform designs.',
    uses: 'Signatures, invitations, artisan packaging, personal brands',
  },
  {
    slug: 'monospace',
    name: 'Monospace',
    description: 'Fixed-width character designs engineered for precision and readability.',
    uses: 'Code editors, terminal displays, data tables, technical manuals',
  },
];

export default function TypographyHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 space-y-16 py-12">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>TYPOGRAPHY DISCOVERY HUB</span>
          </div>

          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase max-w-4xl mx-auto">
            EXPLORE TYPE CLASSIFICATIONS &amp; DESIGN GUIDES
          </h1>

          <p className="text-sm sm:text-lg font-mono text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
            Master typeface categories, visual characteristics, and prompt strategies for generating custom fonts.
          </p>
        </section>

        {/* Category Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="pb-3 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
              TYPEFACE CATEGORY GUIDES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs text-[#a1a1aa]">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="border border-[#27272a] bg-[#121215] rounded-xl p-8 flex flex-col justify-between space-y-6 hover:border-[#e05638] transition-all shadow-xl"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-[#e05638] uppercase tracking-widest block">
                    CATEGORY GUIDE
                  </span>
                  <h3 className="font-display text-2xl text-[#f4f4f5] tracking-tight uppercase">
                    {cat.name}
                  </h3>
                  <p className="text-[#a1a1aa] leading-relaxed">{cat.description}</p>
                  <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-md">
                    <span className="text-[10px] uppercase text-[#71717a] font-bold block">
                      TYPICAL USES
                    </span>
                    <span className="text-white text-[11px] font-bold">{cat.uses}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#27272a] pt-4">
                  <Link
                    href={`/typography/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#e05638] hover:text-white font-bold uppercase transition-colors"
                  >
                    <span>Read Category Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/generate?category=${cat.name}`}
                    className="text-[10px] text-[#a1a1aa] hover:text-[#f4f4f5] underline"
                  >
                    Generate Style
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources & Educational Articles */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="pb-3 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
              FEATURED TYPOGRAPHY ARTICLES &amp; RESOURCES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs text-[#a1a1aa]">
            <Link
              href="/resources/ttf-vs-otf-vs-woff2"
              className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-3 hover:border-[#e05638] transition-all block"
            >
              <span className="text-[10px] font-bold text-[#e05638] uppercase">FORMATS</span>
              <h4 className="font-bold text-[#f4f4f5] text-sm uppercase">TTF vs OTF vs WOFF2</h4>
              <p className="text-[11px] text-[#71717a] line-clamp-2">
                Understanding font file formats, compression, and web performance.
              </p>
            </Link>

            <Link
              href="/resources/how-to-describe-a-font-to-an-ai-font-generator"
              className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-3 hover:border-[#e05638] transition-all block"
            >
              <span className="text-[10px] font-bold text-[#e05638] uppercase">PROMPTING</span>
              <h4 className="font-bold text-[#f4f4f5] text-sm uppercase">AI Font Prompting Guide</h4>
              <p className="text-[11px] text-[#71717a] line-clamp-2">
                How to describe stroke weight, contrast, and visual personality.
              </p>
            </Link>

            <Link
              href="/typography-glossary"
              className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-3 hover:border-[#e05638] transition-all block"
            >
              <span className="text-[10px] font-bold text-[#e05638] uppercase">GLOSSARY</span>
              <h4 className="font-bold text-[#f4f4f5] text-sm uppercase">Typography Glossary</h4>
              <p className="text-[11px] text-[#71717a] line-clamp-2">
                Definitions for ascenders, descenders, kerning, tracking, and leading.
              </p>
            </Link>

            <Link
              href="/resources/how-typography-changes-brand-personality"
              className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-3 hover:border-[#e05638] transition-all block"
            >
              <span className="text-[10px] font-bold text-[#e05638] uppercase">BRANDING</span>
              <h4 className="font-bold text-[#f4f4f5] text-sm uppercase">Brand Personality &amp; Type</h4>
              <p className="text-[11px] text-[#71717a] line-clamp-2">
                How font choices shape brand perception and visual hierarchy.
              </p>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
