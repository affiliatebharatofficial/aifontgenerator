import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Stylish Font Generator — Copy & Paste Cool Lettering',
  description:
    'Transform text into stylish fonts instantly. Create elegant cursive, bold, and aesthetic letterforms for bios, captions, and names.',
  path: '/stylish-font',
  keywords: ['stylish font', 'stylish text', 'cool text font', 'copy paste stylish font'],
});

export default function StylishFontPage() {
  const faqs = [
    {
      question: 'What is a stylish font generator?',
      answer:
        'A stylish font generator translates normal text into decorative Unicode character sets that can be used on platforms where font options are limited.',
    },
    {
      question: 'Can I use stylish fonts in my profile name?',
      answer:
        'Yes. Most social networks and games allow Unicode characters in display names, bio descriptions, and user comments.',
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
        <Breadcrumbs items={[{ name: 'Stylish Font', href: '/stylish-font' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            ELEGANT UNICODE STYLES
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            STYLISH FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Elevate your typography with stylish Unicode character sets. Real-time transformation with instant copy.
          </p>
        </section>

        <FancyFontGenerator initialText="Stylish Text" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
