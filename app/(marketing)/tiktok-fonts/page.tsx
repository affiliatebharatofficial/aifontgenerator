import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'TikTok Fonts Generator — Copy & Paste Bio & Caption Text',
  description:
    'Generate viral TikTok fonts. Copy bold, bubble, circled, and gothic text styles for TikTok video captions, bios, and comments.',
  path: '/tiktok-fonts',
  keywords: ['tiktok fonts', 'tiktok bio font generator', 'tiktok caption fonts', 'copy paste tiktok text'],
});

export default function TikTokFontsPage() {
  const faqs = [
    {
      question: 'How do I change the font in my TikTok bio or username?',
      answer:
        'Copy your transformed text from the generator above, go to Edit Profile in TikTok, and paste it into your Bio or Display Name field.',
    },
    {
      question: 'Will TikTok fonts affect my video search algorithm?',
      answer:
        'Using standard readable Unicode fonts ensures your video captions remain accessible and searchable while visually standing out.',
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
        <Breadcrumbs items={[{ name: 'TikTok Fonts', href: '/tiktok-fonts' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            VIRAL TIKTOK TYPOGRAPHY
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            TIKTOK FONTS GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Generate attention-grabbing Unicode fonts for TikTok video captions, user profiles, and comments.
          </p>
        </section>

        <FancyFontGenerator initialText="TikTok Creator 2026 🚀" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
