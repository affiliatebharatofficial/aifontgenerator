import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Bubble Font Generator — Circled & Dark Bubble Text',
  description:
    'Generate bubble fonts and dark circled text. Copy and paste round enclosed letterforms for TikTok bios, Instagram, and Discord.',
  path: '/bubble-font-generator',
  keywords: ['bubble font generator', 'circled text generator', 'bubble letters copy paste', 'round text generator'],
});

export default function BubbleFontGeneratorPage() {
  const faqs = [
    {
      question: 'What is a bubble font generator?',
      answer:
        'A bubble font generator transforms text into enclosed round symbols (either outline circled letters or filled dark bubbles).',
    },
    {
      question: 'Can I generate bubble numbers?',
      answer:
        'Yes! Digits 0 through 9 are available in both outline circled and dark bubble formats.',
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
        <Breadcrumbs items={[{ name: 'Bubble Font Generator', href: '/bubble-font-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            ENCLOSED ROUND SYMBOLS
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            BUBBLE FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Create dark bubble letters and outline circled text for social profiles and captions.
          </p>
        </section>

        <FancyFontGenerator initialText="Bubble Text 2026" initialFilter="bubble" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
