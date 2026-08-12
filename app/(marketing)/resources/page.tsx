import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Typography Resources & Educational Guides — AI Font Generator',
  description:
    'Educational typography articles covering AI prompt engineering, TTF vs OTF vs WOFF2 format selection, custom font design, and brand personality.',
  path: '/resources',
});

export const articles = [
  {
    slug: 'how-to-describe-a-font-to-an-ai-font-generator',
    title: 'How to Describe a Font to an AI Font Generator',
    description:
      'Learn how to write effective prompts using stroke weight, corner geometry, mood descriptors, and historical style classifications.',
    publishedDate: '2026-08-12',
    readingTime: '4 min read',
  },
  {
    slug: 'ttf-vs-otf-vs-woff2',
    title: 'TTF vs OTF vs WOFF2: Font File Format Guide',
    description:
      'A technical comparison of TrueType, OpenType, and Web Open Font Format 2 binaries for desktop and web applications.',
    publishedDate: '2026-08-12',
    readingTime: '5 min read',
  },
  {
    slug: 'how-to-create-a-custom-font',
    title: 'How to Create a Custom Font from Scratch',
    description:
      'A comprehensive guide to custom typeface creation, glyph geometry, baseline alignment, and binary sfnt table compilation.',
    publishedDate: '2026-08-12',
    readingTime: '6 min read',
  },
  {
    slug: 'how-typography-changes-brand-personality',
    title: 'How Typography Changes Brand Personality',
    description:
      'Discover how stem contrast, x-height, and serif geometry evoke trust, innovation, luxury, or playfulness in brand marks.',
    publishedDate: '2026-08-12',
    readingTime: '4 min read',
  },
  {
    slug: 'what-makes-a-good-display-font',
    title: 'What Makes a Good Display Font',
    description:
      'Key design principles for creating eye-catching headline typefaces optimized for posters, logos, and digital titles.',
    publishedDate: '2026-08-12',
    readingTime: '5 min read',
  },
  {
    slug: 'how-to-prepare-handwriting-for-a-font',
    title: 'How to Prepare Handwriting Characteristics for a Font',
    description:
      'Guidelines for analyzing pen strokes, slant, baseline rhythm, and converting handwritten characteristics into vector prompts.',
    publishedDate: '2026-08-12',
    readingTime: '4 min read',
  },
];

export default function ResourcesHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        <Breadcrumbs items={[{ name: 'Resources', href: '/resources' }]} />

        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            EDUCATIONAL GUIDES & GUIDELINES
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Typography Engineering <br />
            <span className="italic text-[#a1a1aa]">& Knowledge Base.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a1a1aa] font-normal">
            Deep-dive articles written by our engineering team to help designers, developers, and creators master digital vector typography.
          </p>
        </div>

        {/* Articles List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => (
            <Link
              key={art.slug}
              href={`/resources/${art.slug}`}
              className="p-8 border border-[#27272a] bg-[#121215] rounded-md hover:border-[#e05638] transition-colors space-y-4 group block flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-[#e05638] uppercase font-bold tracking-widest">
                  ARTICLE
                </span>
                <h2 className="font-display text-2xl text-[#f4f4f5] group-hover:text-[#e05638] transition-colors uppercase leading-snug">
                  {art.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed font-normal">
                  {art.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#71717a] pt-4 border-t border-[#27272a]">
                <div className="flex items-center gap-3">
                  <span>{art.publishedDate}</span>
                  <span>•</span>
                  <span>{art.readingTime}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#e05638] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
