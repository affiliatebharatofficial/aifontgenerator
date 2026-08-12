import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Instagram Fonts Generator — Copy & Paste Bio Fonts',
  description:
    'Generate stylish Instagram bio fonts. Copy aesthetic cursive, bold, gothic, and small caps fonts for your Instagram profile and captions.',
  path: '/instagram-fonts',
  keywords: ['instagram fonts', 'instagram bio generator', 'ig fonts copy paste', 'aesthetic instagram text'],
});

export default function InstagramFontsPage() {
  const faqs = [
    {
      question: 'How do I change the font in my Instagram bio?',
      answer:
        'Type your bio text into the tool above, click "Copy" next to your favorite style, open Instagram, edit your profile, and paste the text into your Bio field.',
    },
    {
      question: 'Will Instagram fonts work on iOS and Android?',
      answer:
        'Yes! Standard Unicode characters render across both iOS and Android versions of the Instagram app.',
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
        <Breadcrumbs items={[{ name: 'Instagram Fonts', href: '/instagram-fonts' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            INSTAGRAM BIO & CAPTION ENGINE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            INSTAGRAM FONTS GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Create aesthetic cursive, bold, and small caps fonts for your Instagram profile bio and captions.
          </p>
        </section>

        <FancyFontGenerator initialText="✨ Creative Designer & Photographer ✨" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
