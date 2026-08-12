import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Cpu, Layers, ShieldCheck } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';

export const metadata: Metadata = constructMetadata({
  title: 'About Type Engine — AI Font Generator',
  description:
    'Learn about our generative vector type synthesis engine, design philosophy, and OpenType sfnt compilation technology.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'About', href: '/about' }]} />

        {/* Title */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            STUDIO & ENGINEERING
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            BRIDGING PROMPT INTENT <br />
            <span className="italic text-[#a1a1aa]">AND VECTOR GEOMETRY.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a1a1aa] font-normal leading-relaxed">
            Typography is the structural backbone of visual communication. Traditional type design requires months of manual Bezier node placing, kerning table math, and binary sfnt table compilation.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Cpu className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Generative Vector Engine</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              We build generative neural model pipelines trained specifically on vector glyph geometry rather than raster pixels. Prompts synthesize clean cubic Bezier outlines.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Layers className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">True Font Binaries</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Operating on <span className="font-mono text-[#f4f4f5]">ai-fontgenerator.com</span>, our platform outputs real production TTF, OTF, and WOFF2 binaries — with zero mock data or renamed fallback files.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <ShieldCheck className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Technical Honesty</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              We are transparent about our engine capabilities, features in development, licensing rules, and AI output disclaimers.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-8 text-center border-t border-[#27272a]">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
          >
            <span>Launch Font Generator Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

          </div>
  );
}
