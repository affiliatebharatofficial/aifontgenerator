import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Small Caps Font Generator — Mini Capital Letters',
  description:
    'Generate small caps Unicode text. Copy and paste mini capital letters for Instagram bios, Twitter, and subheadings.',
  path: '/small-caps-font-generator',
  keywords: ['small caps font generator', 'small capital text', 'mini caps text maker', 'small caps copy paste'],
});

export default function SmallCapsFontGeneratorPage() {
  const faqs = [
    {
      question: 'What are small caps in Unicode?',
      answer:
        'Small caps are specialized glyphs that display uppercase letterforms rendered at lowercase x-height proportions.',
    },
    {
      question: 'Why is small caps popular for Instagram bios?',
      answer:
        'Small caps create a clean, elegant, editorial look that appears modern without feeling overly loud or aggressive.',
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
        <Breadcrumbs items={[{ name: 'Small Caps Font Generator', href: '/small-caps-font-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            COMPACT CAPITAL LETTERING
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            SMALL CAPS GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Convert lowercase text into clean, compact small capital Unicode letterforms.
          </p>
        </section>

        <FancyFontGenerator initialText="Small Caps Heading" initialFilter="small caps" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
