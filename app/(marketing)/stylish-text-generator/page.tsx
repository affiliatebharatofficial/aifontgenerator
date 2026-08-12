import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Stylish Text Generator — Modern Unicode Text Converter',
  description:
    'Generate stylish text for bios, usernames, and messages. Fast, free online tool for creating bold, script, and aesthetic lettering.',
  path: '/stylish-text-generator',
  keywords: ['stylish text generator', 'stylish text maker', 'cool bio font generator'],
});

export default function StylishTextGeneratorPage() {
  const faqs = [
    {
      question: 'How do I use stylish text on Instagram and TikTok?',
      answer:
        'Copy the generated output from the box above and paste it directly into your profile bio or post captions.',
    },
    {
      question: 'Does stylish text slow down website performance?',
      answer:
        'No. The conversion happens 100% locally in JavaScript inside your browser with zero latency.',
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
        <Breadcrumbs items={[{ name: 'Stylish Text Generator', href: '/stylish-text-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            MODERN UNICODE STYLES
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            STYLISH TEXT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Convert standard text into stylish Unicode lettering. Ideal for profile bios, usernames, and headlines.
          </p>
        </section>

        <FancyFontGenerator initialText="Stylish Profile Bio" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
