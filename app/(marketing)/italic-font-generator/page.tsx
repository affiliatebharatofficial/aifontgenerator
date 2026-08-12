import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Italic Font Generator — Slanted Unicode Copy & Paste',
  description:
    'Generate slanted italic text instantly. Copy and paste mathematical italic and bold-italic characters for bios, tweets, and comments.',
  path: '/italic-font-generator',
  keywords: ['italic font generator', 'italic text generator', 'slanted text copy paste'],
});

export default function ItalicFontGeneratorPage() {
  const faqs = [
    {
      question: 'How do I write italic text on Twitter or Instagram?',
      answer:
        'Since standard text inputs on Twitter and Instagram do not support HTML or Markdown italic tags, use our Italic Font Generator to copy mathematical italic Unicode symbols directly.',
    },
    {
      question: 'Is italic Unicode compatible with modern mobile devices?',
      answer:
        'Yes. Mathematical Italic Unicode symbols are standard across iOS, Android, macOS, and Windows.',
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <JsonLd data={faqJsonLd} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        <Breadcrumbs items={[{ name: 'Italic Font Generator', href: '/italic-font-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            SLANTED UNICODE TEXT
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            ITALIC FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Convert standard text into slanted italic and bold-italic Unicode letterforms.
          </p>
        </section>

        <FancyFontGenerator initialText="Italic Emphasis" initialFilter="italic" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
