import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Fancy Text Generator — Free Unicode Copy & Paste Tool',
  description:
    'Convert standard text into eye-catching fancy text styles. Free online Unicode transformation tool for social media bios and messaging.',
  path: '/fancy-text-generator',
  keywords: ['fancy text generator', 'fancy text maker', 'unicode font transformer', 'copy paste text styles'],
});

export default function FancyTextGeneratorPage() {
  const faqs = [
    {
      question: 'How does the Fancy Text Generator work?',
      answer:
        'It converts ASCII letters into mathematical Unicode characters dynamically inside your web browser. No software download or installation required.',
    },
    {
      question: 'Is there a limit on how much text I can convert?',
      answer:
        'Our tool allows up to 500 characters per conversion to ensure fast browser performance and instant rendering.',
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
        <Breadcrumbs items={[{ name: 'Fancy Text Generator', href: '/fancy-text-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            INSTANT TEXT TRANSFORMATION
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            FANCY TEXT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Transform plain text into unique Unicode styles. Copy and paste decorated fonts anywhere instantly.
          </p>
        </section>

        <FancyFontGenerator initialText="Fancy Text Generator" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
