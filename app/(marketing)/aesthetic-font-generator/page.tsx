import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Aesthetic Font Generator — Vaporwave & Soft Unicode Text',
  description:
    'Generate vaporwave, fullwidth, and aesthetic fonts for Instagram, Tumblr, and TikTok. Copy and paste wide-spaced and decorative lettering.',
  path: '/aesthetic-font-generator',
  keywords: ['aesthetic font generator', 'vaporwave font', 'aesthetic text maker', 'wide text generator'],
});

export default function AestheticFontGeneratorPage() {
  const faqs = [
    {
      question: 'What is an aesthetic font?',
      answer:
        'Aesthetic fonts feature spaced-out vaporwave letters, delicate small caps, and soft script symbols popular across Instagram, Pinterest, and TikTok.',
    },
    {
      question: 'How do fullwidth vaporwave characters work?',
      answer:
        'Fullwidth characters use the Japanese/East Asian Unicode width block to create spaced-out typography without adding standard space characters.',
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
        <Breadcrumbs items={[{ name: 'Aesthetic Font Generator', href: '/aesthetic-font-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            VAPORWAVE & SOFT STYLES
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            AESTHETIC FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Generate fullwidth vaporwave, small caps, and soft aesthetic lettering for captions and social profiles.
          </p>
        </section>

        <FancyFontGenerator initialText="Aesthetic Vibes" initialFilter="aesthetic" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
