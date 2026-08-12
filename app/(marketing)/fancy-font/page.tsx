import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Fancy Font — Copy & Paste Stylish Text & Symbols',
  description:
    'Generate fancy font styles instantly. Convert plain text into stylish mathematical Unicode symbols for Instagram bios, TikTok, and messaging.',
  path: '/fancy-font',
  keywords: ['fancy font', 'fancy text', 'copy paste fancy font', 'stylish unicode fonts'],
});

export default function FancyFontPage() {
  const faqs = [
    {
      question: 'What makes a font "fancy" in Unicode?',
      answer:
        'Fancy text consists of alternate Unicode character ranges—such as mathematical script, gothic fraktur, and double-struck symbols—that mimic decorative typography styles.',
    },
    {
      question: 'How do I copy fancy fonts to social media?',
      answer:
        'Simply type your text into the input box above, click the "Copy" button next to your desired style, and paste it directly into your social media bio or chat.',
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
        <Breadcrumbs items={[{ name: 'Fancy Font', href: '/fancy-font' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            UNICODE TYPOGRAPHY HUB
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            FANCY FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Create stylish fancy font lettering instantly. Copy and paste decorated Unicode symbols anywhere on the web.
          </p>
        </section>

        <FancyFontGenerator />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
