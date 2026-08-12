import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Cool Font Generator — Copy & Paste Cool Text Styles',
  description:
    'Generate cool fonts and text styles instantly. Create gothic, bubble, squared, and circled symbols to stand out on social media.',
  path: '/cool-font-generator',
  keywords: ['cool font generator', 'cool text generator', 'cool fonts copy and paste', 'gamer font generator'],
});

export default function CoolFontGeneratorPage() {
  const faqs = [
    {
      question: 'What types of cool fonts can I generate?',
      answer:
        'You can generate 25 unique styles including Gothic Fraktur, Double Struck, Dark Bubble, Circled, Small Caps, and Reverse Mirrored text.',
    },
    {
      question: 'Can I use cool fonts for gaming usernames?',
      answer:
        'Yes! Platforms like Discord, Steam, Roblox, and Twitch support Unicode symbols in display names.',
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
        <Breadcrumbs items={[{ name: 'Cool Font Generator', href: '/cool-font-generator' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            GAMER & SOCIAL UNICODE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            COOL FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Create cool Unicode text styles for Discord handles, gaming bios, and social captions.
          </p>
        </section>

        <FancyFontGenerator initialText="Cool Username 2026" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
