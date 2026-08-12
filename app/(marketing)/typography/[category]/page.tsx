import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  Sliders,
} from 'lucide-react';

interface CategoryGuideData {
  name: string;
  categoryParam: string;
  headline: string;
  whatIsIt: string;
  characteristics: string[];
  commonUses: string[];
  whenToChoose: string;
  promptGuide: string[];
  examplePrompts: string[];
}

const CATEGORY_GUIDES: Record<string, CategoryGuideData> = {
  'sans-serif': {
    name: 'Sans Serif',
    categoryParam: 'Sans Serif',
    headline: 'Modern, Clean, and High-Clarity Typeface Design',
    whatIsIt:
      'Sans Serif typefaces are character designs that lack small stroke projections (serifs) at the ends of character stems. Originating in the early 19th century and popularized by modernist Swiss typography, sans serifs project clarity, efficiency, and contemporary style.',
    characteristics: [
      'Clean terminal stroke ends without decorative serifs',
      'Uniform or low-stroke contrast between vertical and horizontal lines',
      'High legibility across small mobile screens and digital interfaces',
      'Geometric, humanist, or grotesque structural proportions',
    ],
    commonUses: [
      'Web application user interfaces & mobile apps',
      'Modern tech company branding and tech logos',
      'Signage, wayfinding, and digital dashboards',
      'High-density data tables and body copy',
    ],
    whenToChoose:
      'Choose Sans Serif when your brand or project prioritizes modern simplicity, digital clarity, high screen legibility, or minimalist aesthetic precision.',
    promptGuide: [
      'Specify geometric or humanist stroke geometry (e.g. "geometric circular O and sharp vertices")',
      'Indicate desired stroke contrast (e.g. "low stroke contrast, consistent stem width")',
      'Mention corner styles (e.g. "crisp sharp corners" or "subtly rounded corners")',
    ],
    examplePrompts: [
      'Modern geometric sans serif typeface with clean circular curves, sharp corners, and high legibility',
      'Humanist sans serif font with subtle calligraphic stroke variation and balanced open counters',
      'Minimalist tech brand sans serif font with bold weight and condensed character width',
    ],
  },
  serif: {
    name: 'Serif',
    categoryParam: 'Serif',
    headline: 'Classic Elegance, Editorial Authority, and Timeless Style',
    whatIsIt:
      'Serif typefaces feature small decorative flourishes attached to the main strokes of letters. Derived from traditional stone carving and metal typesetting, serif fonts carry historical weight, literary authority, and refined elegance.',
    characteristics: [
      'Decorative terminal serifs (bracketed, slab, or hairline serifs)',
      'Pronounced stroke contrast between thick vertical downstrokes and thin horizontal crossbars',
      'Strong horizontal reading flow across printed editorial paragraphs',
      'Refined ascender and descender proportions',
    ],
    commonUses: [
      'Books, magazines, and long-form editorial publishing',
      'Luxury fashion, jewelry, and high-end brand identities',
      'Legal, academic, and financial institutional communications',
      'Editorial headlines and editorial storytelling websites',
    ],
    whenToChoose:
      'Choose Serif when you want your project to evoke trust, tradition, luxury, intellectual authority, or timeless craftsmanship.',
    promptGuide: [
      'Specify the serif style (e.g. "sharp bracketed serifs" or "bold slab serifs")',
      'Control stroke contrast (e.g. "high contrast Bodoni-style strokes")',
      'Describe axis angle (e.g. "traditional diagonal stress" or "modern vertical stress")',
    ],
    examplePrompts: [
      'High-contrast luxury serif typeface with sharp bracketed serifs and elegant ball terminals',
      'Editorial serif headline font with high stroke contrast, vertical stress, and delicate serifs',
      'Modern slab serif typeface with thick rectangular serifs and sturdy geometric proportions',
    ],
  },
  display: {
    name: 'Display',
    categoryParam: 'Display',
    headline: 'Bold Expression, Visual Impact, and Headline Power',
    whatIsIt:
      'Display typefaces are bold, expressive fonts engineered specifically for large scale display uses like headlines, titles, poster graphics, and logo design. Rather than optimizing for small body text readability, display fonts focus on maximum visual personality.',
    characteristics: [
      'Exaggerated stroke weight variations and unique glyph geometry',
      'Distinctive visual personality tailored to immediate visual attention',
      'Engineered for sizes 24px and larger',
      'Custom counter shapes, stylized ligatures, or unconventional apertures',
    ],
    commonUses: [
      'Poster titles, event graphics, and magazine covers',
      'Brand logos, hero section headers, and campaign titles',
      'Packaging design and merchandise graphics',
    ],
    whenToChoose:
      'Choose Display when your headline needs to make an immediate, memorable visual statement and define a unique artistic tone.',
    promptGuide: [
      'Emphasize visual mood and artistic style (e.g. "brutalist heavy display")',
      'Describe extreme proportions (e.g. "ultra-bold weight with tight letter spacing")',
      'Specify decorative attributes (e.g. "stencil cuts" or "geometric inline strokes")',
    ],
    examplePrompts: [
      'Bold brutalist display typeface with ultra-wide character proportions and heavy geometric stems',
      'Retro 1970s display font with flowing curvy serifs and high contrast letterforms',
      'Futuristic sci-fi display typeface with razor-sharp angled cuts and stencil gaps',
    ],
  },
  handwritten: {
    name: 'Handwritten',
    categoryParam: 'Handwritten',
    headline: 'Organic Personality, Human Touch, and Authentic Expression',
    whatIsIt:
      'Handwritten typefaces replicate organic pen, brush, pencil, or marker letterforms created by the human hand. They infuse digital designs with warmth, authenticity, informal charm, and personal touch.',
    characteristics: [
      'Natural stroke weight variation imitating ink flow or pen pressure',
      'Organic, non-uniform baseline alignments and playful angles',
      'Warm human personality that contrasts rigid geometric grids',
      'Casual, cursive, or calligraphic letter connections',
    ],
    commonUses: [
      'Personal branding, creator logos, and signatures',
      'Artisan product packaging, cafe menus, and craft labels',
      'Greeting cards, wedding invitations, and editorial quotes',
    ],
    whenToChoose:
      'Choose Handwritten when your project requires authentic human warmth, informal friendliness, or personal artistic flair.',
    promptGuide: [
      'Specify the writing tool (e.g. "fountain pen stroke", "quick marker sketch", "fine liner")',
      'Indicate speed and rhythm (e.g. "casual swift handwriting" or "delicate calligraphic script")',
      'Define stroke texture (e.g. "smooth ink flow" or "textured dry brush")',
    ],
    examplePrompts: [
      'Casual fountain pen handwriting font with natural ink flow, connected cursive strokes, and organic baseline',
      'Bold dry-brush handwritten typeface with textured stroke edges and energetic letterforms',
      'Minimalist fine-liner handwriting font with thin uniform strokes and relaxed spacing',
    ],
  },
  monospace: {
    name: 'Monospace',
    categoryParam: 'Monospace',
    headline: 'Fixed-Width Precision, Technical Aesthetics, and Code Clarity',
    whatIsIt:
      'Monospace typefaces assign identical horizontal advance width to every single character, number, and symbol. Originally created for mechanical typewriters, monospace fonts are the backbone of software code editors, terminal interfaces, and technical design.',
    characteristics: [
      'Uniform fixed horizontal advance width across all glyphs',
      'Distinctive character disambiguation (e.g. slashed zero, distinct 1/l/I differentiation)',
      'Engineered horizontal alignment in tabular data grids and code columns',
      'Technical, industrial, or retro typewriter aesthetic',
    ],
    commonUses: [
      'Code editors, IDEs, and developer tools',
      'Terminal interfaces, command-line consoles, and technical dashboards',
      'Financial ledgers, data tables, and tabular specifications',
      'Tech-inspired branding, cyberpunk graphics, and retro tech layouts',
    ],
    whenToChoose:
      'Choose Monospace when your project involves code, technical data, tabular alignment, or a developer-centric technical aesthetic.',
    promptGuide: [
      'Emphasize fixed-width legibility features (e.g. "slashed zero, wide crossbars on i and l")',
      'Specify technical style (e.g. "modern developer monospace" or "retro typewriter")',
      'Control stem weight and corner style',
    ],
    examplePrompts: [
      'Modern developer monospace font with slashed zero, high legibility code symbols, and crisp geometry',
      'Retro mechanical typewriter monospace typeface with subtle ink stamp texture and bracketed serifs',
      'Cyberpunk technical monospace font with sharp condensed glyphs and futuristic angles',
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const guide = CATEGORY_GUIDES[category.toLowerCase()];

  if (!guide) {
    return { title: 'Category Guide Not Found' };
  }

  return {
    title: `${guide.name} Font Design Guide & AI Prompting — AI Font Generator`,
    description: `Complete guide to ${guide.name} fonts. Learn visual characteristics, common uses, when to choose ${guide.name} typefaces, and AI prompt engineering tips.`,
  };
}

export default async function CategoryGuidePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const guide = CATEGORY_GUIDES[category.toLowerCase()];

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/typography"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Typography Discovery</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4 border-b border-[#27272a] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CATEGORY GUIDE</span>
          </div>

          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase">
            {guide.name} Typeface Design
          </h1>

          <p className="text-base sm:text-xl font-mono text-[#a1a1aa]">
            {guide.headline}
          </p>

          <div className="pt-4">
            <Link
              href={`/generate?category=${encodeURIComponent(guide.categoryParam)}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Create {guide.name} Style Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* What Is It */}
        <section className="space-y-4 font-mono text-xs text-[#a1a1aa]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#f4f4f5] font-bold border-b border-[#27272a] pb-2">
            01 • WHAT IS A {guide.name.toUpperCase()} FONT?
          </h2>
          <p className="text-sm text-[#a1a1aa] leading-relaxed font-mono">
            {guide.whatIsIt}
          </p>
        </section>

        {/* Visual Characteristics */}
        <section className="space-y-4 font-mono text-xs text-[#a1a1aa]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#f4f4f5] font-bold border-b border-[#27272a] pb-2">
            02 • TYPICAL VISUAL CHARACTERISTICS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.characteristics.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-[#27272a] bg-[#121215] flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-[#f4f4f5] font-mono">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Common Uses & When to Choose */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs text-[#a1a1aa]">
          <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs border-b border-[#27272a] pb-2">
              03 • COMMON DESIGN USES
            </h3>
            <ul className="space-y-2">
              {guide.commonUses.map((use, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e05638]" />
                  <span className="text-[#a1a1aa]">{use}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-[#27272a] bg-[#121215] rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-[#f4f4f5] uppercase tracking-wider text-xs border-b border-[#27272a] pb-2">
              04 • WHEN TO CHOOSE THIS STYLE
            </h3>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              {guide.whenToChoose}
            </p>
          </div>
        </section>

        {/* How to Describe to AI Generator */}
        <section className="border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-8 space-y-6 font-mono text-xs text-[#a1a1aa]">
          <div className="space-y-1 border-b border-[#27272a] pb-4">
            <span className="text-[10px] font-bold text-[#e05638] uppercase tracking-widest block">
              AI PROMPT ENGINEERING
            </span>
            <h3 className="font-bold text-lg text-[#f4f4f5] uppercase tracking-tight">
              HOW TO DESCRIBE A {guide.name.toUpperCase()} FONT TO THE GENERATOR
            </h3>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-[#71717a] block">
              Key Prompting Tips:
            </span>
            <ul className="space-y-2">
              {guide.promptGuide.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#e05638] font-bold">•</span>
                  <span className="text-[#f4f4f5]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-[10px] uppercase font-bold text-[#71717a] block">
              Example Prompts:
            </span>
            <div className="space-y-2">
              {guide.examplePrompts.map((prompt, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#09090b] border border-[#27272a] rounded-md text-emerald-400 text-xs font-mono leading-relaxed"
                >
                  &ldquo;{prompt}&rdquo;
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="p-8 sm:p-12 border border-[#27272a] bg-[#121215] rounded-xl text-center space-y-6">
          <h3 className="font-display font-normal text-3xl sm:text-4xl text-[#f4f4f5] tracking-tight uppercase">
            READY TO GENERATE A CUSTOM {guide.name.toUpperCase()} FONT?
          </h3>
          <p className="text-xs font-mono text-[#a1a1aa] max-w-xl mx-auto">
            Our AI Type Studio pre-configures your selected category parameters so you can start styling immediately.
          </p>
          <div>
            <Link
              href={`/generate?category=${encodeURIComponent(guide.categoryParam)}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Create {guide.name} Style</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
