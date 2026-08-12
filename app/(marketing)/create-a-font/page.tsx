import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Download } from 'lucide-react';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Create a Font — Step-by-Step Custom Typeface Creation Guide',
  description:
    'Learn how to create a custom font from text prompts. Follow our simple step-by-step guide to generate TTF, OTF, and WOFF2 files.',
  path: '/create-a-font',
});

export default function CreateAFontPage() {
  const faqs = [
    {
      question: 'Do I need prior typography experience to create a font?',
      answer:
        'No prior typography or font editing experience is required. Simply describe your visual aesthetic (such as &quot;minimalist modern sans with rounded corners&quot;) and our AI vector engine handles glyph geometry calculation and font binary compilation.',
    },
    {
      question: 'How long does it take to create a font?',
      answer:
        'Generating a complete 75-character OpenType font takes approximately 10 to 30 seconds, depending on server load and AI provider pipeline status.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        <Breadcrumbs items={[{ name: 'Create a Font', href: '/create-a-font' }]} />

        <section className="space-y-6 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            BEGINNER&apos;S TYPE DESIGN GUIDE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            How to Create a Font <br />
            <span className="italic text-[#a1a1aa]">From Scratch in Seconds.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Follow a simple 3-step process to generate real, production-ready desktop and web fonts without complex software installations.
          </p>

          <div className="pt-4">
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
            >
              <span>Create Your First Font</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 3 Step Process */}
        <section className="space-y-6">
          <div className="border border-[#27272a] bg-[#121215] p-8 sm:p-12 rounded-md space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-[#e05638]">STEP 01</span>
              <FileText className="w-6 h-6 text-[#71717a]" />
            </div>
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">Describe Your Typeface</h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Enter a text prompt describing the mood, stem weight, corner treatment, and stroke contrast you desire. Choose your target category (Serif, Sans Serif, Display, Monospace).
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 sm:p-12 rounded-md space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-[#e05638]">STEP 02</span>
              <CheckCircle2 className="w-6 h-6 text-[#71717a]" />
            </div>
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">Synthesize & Inspect</h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Our AI provider engine generates 75 vector glyph outlines. Review your generated font on our real-time interactive specimen stage to test live preview text, tracking, and leading.
            </p>
          </div>

          <div className="border border-[#27272a] bg-[#121215] p-8 sm:p-12 rounded-md space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-[#e05638]">STEP 03</span>
              <Download className="w-6 h-6 text-[#71717a]" />
            </div>
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">Download Font Files</h2>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Download your compiled TrueType (.ttf), OpenType (.otf), and Web (.woff2) font files to install on desktop operating systems or embed in websites.
            </p>
          </div>
        </section>

        <FaqSection faqs={faqs} />
      </main>

      <Footer />
    </div>
  );
}
