import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Bold Font Generator — Copy & Paste Heavy Bold Text',
  description:
    'Generate heavy bold Unicode text instantly. Copy bold sans-serif, serif, and script characters for social media headlines and bios.',
  path: '/bold-font-generator',
  keywords: ['bold font generator', 'bold text generator', 'bold letters copy paste', 'heavy font generator'],
});

export default function BoldFontGeneratorPage() {
  const faqs = [
    {
      question: 'How do I generate bold text for Facebook or Instagram?',
      answer:
        'Social platforms often lack rich text formatting buttons. Our Bold Font Generator transforms plain text into mathematical bold Unicode symbols that work natively on any post or comment.',
    },
    {
      question: 'Are numbers supported in bold font generation?',
      answer:
        'Yes! Digits 0 through 9 are fully supported in Mathematical Bold and Sans-Serif Bold Unicode ranges.',
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
        <Breadcrumbs items={[{ name: 'Bold Font Generator', href: '/bold-font-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            HEAVY UNICODE LETTERING
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            BOLD FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Create heavy bold text instantly for headlines, captions, and profile bios.
          </p>
        </section>

        <FancyFontGenerator initialText="Bold Headline Text" initialFilter="bold" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
