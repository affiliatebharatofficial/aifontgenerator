import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { constructMetadata } from '@/lib/seo/metadata';
import { getWebSiteJsonLd, getWebApplicationJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'AI Font Generator — Create Custom Fonts with AI',
  description:
    'Create custom fonts with AI. Describe your typeface, choose its style, and generate a real downloadable font.',
  path: '/',
});

export default function LandingPage() {
  const websiteSchema = getWebSiteJsonLd();
  const webAppSchema = getWebApplicationJsonLd();

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <JsonLd data={[websiteSchema, webAppSchema]} />
      
      <main className="flex-1 space-y-24 sm:space-y-32 py-12 sm:py-20">
        {/* 1. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs font-mono font-bold uppercase tracking-wider">
              <span>AI TYPE DESIGN TOOL</span>
            </div>

            <h1 className="font-display font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-[#f4f4f5] uppercase">
              MAKE A TYPEFACE <br />
              <span className="italic text-[#a1a1aa]">THAT FEELS LIKE YOURS.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#a1a1aa] max-w-2xl font-normal leading-relaxed">
              Describe a style, shape a direction, and turn your idea into a real downloadable typeface.
              Export production-ready TTF, OTF, and WOFF2 files directly from text prompts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
              >
                <span>Create a Font</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-[#f4f4f5] transition-all"
              >
                <span>Explore How It Works</span>
              </Link>
            </div>
          </div>

          {/* 2. HERO TYPOGRAPHIC SPECIMEN VISUAL */}
          <div className="border border-[#27272a] rounded-lg bg-[#121215] p-6 sm:p-12 space-y-8 type-grid-pattern">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#27272a] pb-6 gap-4 font-mono text-xs text-[#71717a]">
              <span className="uppercase font-bold tracking-wider text-[#a1a1aa]">
                SPECIMEN • GEOMETRIC SANS
              </span>
              <span>1000 UPM • 800 ASCENDER • -200 DESCENDER</span>
            </div>

            <div className="space-y-6">
              <div className="text-6xl sm:text-9xl font-display font-normal text-[#f4f4f5] tracking-tight leading-none">
                Aa Bb Cc
              </div>
              <div className="text-xl sm:text-4xl font-mono text-[#a1a1aa] tracking-widest break-all">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </div>
              <div className="text-base sm:text-2xl font-mono text-[#71717a] tracking-widest break-all">
                abcdefghijklmnopqrstuvwxyz 0123456789
              </div>
            </div>
          </div>
        </section>

        {/* 3. EDITORIAL TYPOGRAPHY SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="pb-6 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              01 • EDITORIAL EXPRESSION
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-4">
              <span className="font-mono text-xs text-[#e05638] uppercase font-bold">01 • GEOMETRIC</span>
              <p className="font-display text-5xl text-[#f4f4f5] leading-none">CREATE</p>
              <p className="text-xs text-[#71717a]">Sharp angles, minimal stroke width, and bold stems.</p>
            </div>

            <div className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-4">
              <span className="font-mono text-xs text-[#e05638] uppercase font-bold">02 • DISPLAY</span>
              <p className="font-display italic text-5xl text-[#f4f4f5] leading-none">SHAPE</p>
              <p className="text-xs text-[#71717a]">High-contrast serifs designed for headlines and posters.</p>
            </div>

            <div className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-4">
              <span className="font-mono text-xs text-[#e05638] uppercase font-bold">03 • HUMANIST</span>
              <p className="font-sans-ui font-extrabold text-5xl text-[#f4f4f5] leading-none tracking-tight">EXPRESS</p>
              <p className="text-xs text-[#71717a]">Warm curves, organic proportions, and open counters.</p>
            </div>

            <div className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-4">
              <span className="font-mono text-xs text-[#e05638] uppercase font-bold">04 • MONOSPACE</span>
              <p className="font-mono text-5xl text-[#f4f4f5] leading-none">TYPE</p>
              <p className="text-xs text-[#71717a]">Fixed-width grid geometry for code and technical layout.</p>
            </div>
          </div>
        </section>

        {/* 4. CREATIVE GENERATOR PROMPT SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#27272a] rounded-lg bg-[#121215] p-8 sm:p-16 space-y-8 text-center sm:text-left">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
                PROMPT TO VECTOR
              </span>
              <h2 className="font-display font-normal text-3xl sm:text-5xl text-[#f4f4f5] leading-tight">
                Your next typeface starts with a sentence.
              </h2>
            </div>

            <div className="p-6 rounded-md bg-[#09090b] border border-[#27272a] space-y-4">
              <span className="text-[10px] font-mono uppercase text-[#71717a] font-bold block text-left">
                INPUT PROMPT DEMO
              </span>
              <p className="font-mono text-sm sm:text-lg text-[#f4f4f5] text-left leading-relaxed">
                &ldquo;Bold geometric display font with sharp triangular serifs and high stroke contrast for architectural branding&rdquo;
              </p>
            </div>

            <div className="flex justify-end">
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-semibold uppercase tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
              >
                <span>Start Creating</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. EDITORIAL PROCESS STEPS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="pb-6 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              02 • HOW TYPE IS MADE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="font-mono text-4xl text-[#e05638] font-bold">01</span>
              <h3 className="text-xl font-bold uppercase tracking-wide text-[#f4f4f5]">DESCRIBE</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Start with an idea, mood, reference, or visual direction. Define category, weight, width, and character parameters.
              </p>
            </div>

            <div className="space-y-4">
              <span className="font-mono text-4xl text-[#e05638] font-bold">02</span>
              <h3 className="text-xl font-bold uppercase tracking-wide text-[#f4f4f5]">GENERATE</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Our AI vector engine synthesizes 75 OpenType glyph outlines and compiles valid sfnt binary font structures.
              </p>
            </div>

            <div className="space-y-4">
              <span className="font-mono text-4xl text-[#e05638] font-bold">03</span>
              <h3 className="text-xl font-bold uppercase tracking-wide text-[#f4f4f5]">DOWNLOAD</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Export real, production-ready font files instantly to use across desktop design tools and web applications.
              </p>
            </div>
          </div>
        </section>

        {/* 6. SUPPORTED FONT FORMATS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="pb-6 border-b border-[#27272a]">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              03 • PRODUCTION FORMATS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-3">
              <span className="font-mono text-4xl font-bold text-[#f4f4f5]">TTF</span>
              <h4 className="text-xs font-bold uppercase text-[#e05638]">TrueType Font</h4>
              <p className="text-xs text-[#71717a]">Standard desktop font format compatible with macOS, Windows, and graphics applications.</p>
            </div>

            <div className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-3">
              <span className="font-mono text-4xl font-bold text-[#f4f4f5]">OTF</span>
              <h4 className="text-xs font-bold uppercase text-[#e05638]">OpenType Font</h4>
              <p className="text-xs text-[#71717a]">Professional typography format supporting advanced OpenType tables and design workflows.</p>
            </div>

            <div className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-3">
              <span className="font-mono text-4xl font-bold text-[#f4f4f5]">WOFF2</span>
              <h4 className="text-xs font-bold uppercase text-[#e05638]">Web Open Font Format 2</h4>
              <p className="text-xs text-[#71717a]">Compressed web-ready format optimized for ultra-fast page rendering and web performance.</p>
            </div>
          </div>
        </section>
      </main>

          </div>
  );
}
