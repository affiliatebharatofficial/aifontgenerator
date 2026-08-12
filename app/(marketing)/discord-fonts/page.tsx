import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';

export const metadata: Metadata = constructMetadata({
  title: 'Discord Fonts Generator — Server Nicknames & Channel Names',
  description:
    'Generate custom Discord fonts for server channel titles, nicknames, and chat. Copy gothic, monospace, bold, and strikethrough text.',
  path: '/discord-fonts',
  keywords: ['discord fonts', 'discord nickname generator', 'discord channel name font', 'fancy discord text'],
});

export default function DiscordFontsPage() {
  const faqs = [
    {
      question: 'How do I use fancy fonts in Discord server channel names?',
      answer:
        'Copy the generated Unicode text, edit your Discord server channel settings, and paste the text into the Channel Name input.',
    },
    {
      question: 'Will Discord nicknames show up properly for all members?',
      answer:
        'Yes. Standard Unicode characters render cleanly across Discord desktop, mobile, and browser clients.',
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
        <Breadcrumbs items={[{ name: 'Discord Fonts', href: '/discord-fonts' }]} />

        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            DISCORD SERVER & PROFILE ENGINE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            DISCORD FONTS GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Customize your Discord nicknames, role titles, and server channel names with unique Unicode text.
          </p>
        </section>

        <FancyFontGenerator initialText="💬 general-chat" initialFilter="gothic" />
        <FancyVsRealFontSection />
        <FaqSection faqs={faqs} />
      </main>
    </div>
  );
}
