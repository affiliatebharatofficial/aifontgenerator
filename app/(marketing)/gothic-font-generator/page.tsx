import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Gothic Font Generator — Old English & Fraktur Text',
  description:
    'Generate Old English fraktur and gothic text styles. Copy and paste medieval blackletter Unicode fonts for bios, logos, and Discord.',
  path: '/gothic-font-generator',
  keywords: ['gothic font generator', 'old english font generator', 'fraktur generator', 'blackletter copy paste'],
});

export default function GothicFontGeneratorPage() {
  const faqs = [
    {
      question: 'What is Fraktur gothic text in Unicode?',
      answer:
        'Fraktur Unicode consists of mathematical alphanumeric symbols modeled after classical German blackletter and medieval manuscripts.',
    },
    {
      question: 'Can I use gothic fonts on Discord and Instagram?',
      answer:
        'Yes. Gothic fraktur characters are official Unicode symbols supported across Discord channels, Instagram bios, and Twitter posts.',
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
        <Breadcrumbs items={[{ name: 'Gothic Font Generator', href: '/gothic-font-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            MEDIEVAL BLACKLETTER & FRAKTUR
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            GOTHIC FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Convert standard text into Old English Gothic and Fraktur lettering. Instant copy and paste.
          </p>
        </section>

        <FancyFontGenerator initialText="Gothic Fraktur Style" initialFilter="gothic" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
