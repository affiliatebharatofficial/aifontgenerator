import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Cpu, Layers, Download } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'AI Font Generator — Turn Text Prompts into Downloadable Vector Typefaces',
  description:
    'Use artificial intelligence to generate production-ready custom fonts. Input text prompts to synthesize cubic Bezier glyph outlines in TTF, OTF, and WOFF2 formats.',
  path: '/ai-font-generator',
});

export default function AiFontGeneratorPage() {
  const faqs = [
    {
      question: 'How does an AI Font Generator construct real font files?',
      answer:
        'Our neural generative engine analyzes descriptive text prompts (such as &quot;sharp geometric sans with high stroke contrast&quot;) and calculates mathematical cubic Bezier node vectors for 75 OpenType glyph outlines. These vectors are compiled on demand into valid binary sfnt tables (TTF, OTF, and WOFF2).',
    },
    {
      question: 'Can I export fonts for web and desktop publishing?',
      answer:
        'Yes. Every generated typeface is exported in standard desktop formats (.ttf and .otf) compatible with macOS, Windows, Adobe Creative Cloud, and Figma, alongside compressed web font binaries (.woff2) optimized for modern browsers.',
    },
    {
      question: 'Are generated fonts royalty-free for commercial projects?',
      answer:
        'Generated font files are provided for your personal and commercial design projects according to our terms of service. Because AI outputs are synthesized from text parameters, we recommend reviewing font outlines before trademarking brand logos.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'AI Font Generator', href: '/ai-font-generator' }]} />

        {/* Hero Section */}
        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            NEURAL TYPEWRITING ENGINE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Generative AI Vector <br />
            <span className="italic text-[#a1a1aa]">Type Synthesis.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Transform plain text prompt descriptions into fully compliant, scalable OpenType and WebFont binaries. Our AI models directly output vector math rather than static raster images.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Synthesize AI Font Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Core Architecture Capabilities */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Cpu className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Prompt Intelligence</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Interprets stylistic descriptors like &quot;cyberpunk neon display&quot; or &quot;editorial high-contrast serif&quot; into structural glyph parameters.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Layers className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Pure Vector Geometry</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Generates clean, resolution-independent Bezier curves rather than pixel approximations, ensuring smooth rendering at any point size.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 rounded-md space-y-4">
            <Download className="w-8 h-8 text-[#e05638]" />
            <h2 className="font-display text-xl text-[#f4f4f5] uppercase">Binary Compilation</h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Assembles complete Unicode glyph maps directly into executable TTF, OTF, and WOFF2 font tables ready for desktop and web integration.
            </p>
          </div>
        </section>

        {/* Primary Use Cases */}
        <section className="border border-[#27272a] bg-[#121215] p-8 sm:p-12 rounded-md space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-[#e05638] font-bold">APPLICATION DOMAINS</span>
            <h2 className="font-display text-2xl sm:text-4xl text-[#f4f4f5] uppercase">
              Where to Deploy AI-Generated Typefaces
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-display text-lg text-[#f4f4f5] uppercase">Brand Identity & Titling</h3>
              <p>
                Create unique headline styles for brand marks, logotypes, campaign identities, and packaging labels that stand out from standard web font catalogs.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-lg text-[#f4f4f5] uppercase">Web & Product Design</h3>
              <p>
                Embed compressed WOFF2 web fonts directly into CSS files with high performant rendering across mobile viewports and high-DPI displays.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-lg text-[#f4f4f5] uppercase">Game UI & Poster Art</h3>
              <p>
                Craft stylized futuristic, fantasy, or retro arcade fonts tailored specifically for game titles, HUD overlays, and promotional artwork.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-lg text-[#f4f4f5] uppercase">Editorial & Publishing</h3>
              <p>
                Synthesize distinct display serifs and high-contrast headlines for editorial magazines, digital books, and art publication titles.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <FaqSection faqs={faqs} />
      </main>

      <Footer />
    </div>
  );
}
