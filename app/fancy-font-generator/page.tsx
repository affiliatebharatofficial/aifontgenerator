import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { getSiteSetting } from '@/lib/admin/settings-service';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { FaqSection } from '@/components/marketing/FaqSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { FancyFontGenerator } from '@/components/fancy-font/FancyFontGenerator';
import { FancyVsRealFontSection } from '@/components/fancy-font/FancyVsRealFontSection';
import { FancyAdBanner } from '@/components/fancy-font/FancyAdBanner';

export const metadata: Metadata = constructMetadata({
  title: 'Fancy Font Generator — Copy & Paste Stylish Fonts',
  description:
    'Generate stylish Unicode fancy text instantly. Create bold, cursive, gothic, aesthetic and cool text styles and copy them anywhere for free.',
  path: '/fancy-font-generator',
  keywords: [
    'fancy font generator',
    'unicode text generator',
    'copy and paste fonts',
    'stylish text generator',
    'cool font generator',
    'aesthetic font generator',
    'instagram fonts',
    'tiktok fonts',
    'discord fonts',
  ],
});

export default async function FancyFontGeneratorPage() {
  const adsEnabled = await getSiteSetting<boolean>('ads_enabled', false);
  const publisherId = await getSiteSetting<string>('adsense_publisher_id', '');
  const contentSlot = await getSiteSetting<string>('adsense_content_slot', '');

  const faqs = [
    {
      question: 'What is a Fancy Font Generator?',
      answer:
        'A Fancy Font Generator is a browser-based tool that transforms ordinary text into stylish, mathematical Unicode characters (such as bold, script, fraktur, double-struck, small caps, and circled text) that can be copied and pasted across websites, apps, and social media platforms.',
    },
    {
      question: 'Are these real font files like TTF or OTF?',
      answer:
        'No. This tool generates mathematical Unicode text symbols rather than installable binary font files. If you need downloadable TTF, OTF, or WOFF2 font files for software like Photoshop or web design, use our AI Font Generator.',
    },
    {
      question: 'Can I copy fancy text to Instagram, TikTok, and Discord?',
      answer:
        'Yes! Because the generated output consists of standard Unicode character codes, you can copy and paste them directly into your Instagram bio, TikTok captions, Discord handles, Twitter posts, and WhatsApp messages.',
    },
    {
      question: 'Why do some characters or scripts remain unchanged?',
      answer:
        'Mathematical Unicode character ranges only exist for specific Latin alphabets and digits. Non-Latin scripts (such as Devanagari, Arabic, Japanese, Chinese) and certain symbols do not have mathematical Unicode equivalents and are safely preserved intact without corruption.',
    },
    {
      question: 'Does fancy text work on every website and browser?',
      answer:
        'Most modern operating systems, web browsers, and social networks support the full Unicode specification. On older systems, rare Unicode symbols may display as blank boxes or system fallback glyphs.',
    },
    {
      question: 'Is this Fancy Font Generator completely free?',
      answer:
        'Yes! The Fancy Font Generator runs 100% locally in your browser. There are no character limits paywalls, account requirements, or server API limits.',
    },
    {
      question: 'How do I create a real downloadable font binary?',
      answer:
        'To create a custom downloadable font binary (TTF/OTF/WOFF2), visit our AI Font Generator, enter a description of your desired typeface, and synthesize a complete vector font file.',
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
      {/* Schema.org FAQ Data */}
      <JsonLd data={faqJsonLd} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        <Breadcrumbs items={[{ name: 'Fancy Font Generator', href: '/fancy-font-generator' }]} />

        {/* Hero Section */}
        <section className="space-y-4 max-w-4xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            100% FREE UNICODE TEXT ENGINE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl lg:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            FANCY FONT GENERATOR
          </h1>
          <p className="text-base sm:text-xl text-[#a1a1aa] font-normal leading-relaxed">
            Turn ordinary text into stylish Unicode fonts you can copy and paste anywhere.
          </p>
        </section>

        {/* Main Generator Component */}
        <FancyFontGenerator />

        {/* AdSense Placement 1 */}
        <FancyAdBanner
          adsEnabled={adsEnabled}
          publisherId={publisherId}
          slotId={contentSlot}
          label="ADVERTISEMENT"
        />

        {/* Technical Product Comparison & Conversion CTA */}
        <FancyVsRealFontSection />

        {/* Educational SEO Editorial Content */}
        <section className="border-t border-[#27272a] pt-12 space-y-10 max-w-4xl text-[#a1a1aa] text-sm leading-relaxed">
          <div className="space-y-3">
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase tracking-wide">
              What Is a Fancy Font Generator?
            </h2>
            <p>
              A Fancy Font Generator is an online utility that converts plain ASCII text into stylized Unicode symbols. Rather than changing the visual font family via CSS styles (which only render on your personal website), a Unicode generator translates standard letters into alternate mathematical Unicode symbols.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase tracking-wide">
              How Does Fancy Text Work?
            </h2>
            <p>
              The Universal Character Set (Unicode) contains over 140,000 characters, including dedicated blocks for mathematical alphanumeric symbols, script glyphs, fraktur letters, enclosed alphanumerics, and small caps. When you type into our tool, JavaScript maps each letter directly to its mathematical Unicode counterpart in real time inside your browser.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase tracking-wide">
              Where Can I Use Fancy Text?
            </h2>
            <p>
              Because the resulting text consists of universal Unicode characters, you can copy and paste your generated text into any input field that supports standard text string rendering, including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-[#d4d4d8]">
              <li><strong>Instagram:</strong> Bio descriptions, profile names, story captions, and comments.</li>
              <li><strong>TikTok:</strong> Account handles, video descriptions, and comment sections.</li>
              <li><strong>Discord:</strong> Server nicknames, channel names, role titles, and chat messages.</li>
              <li><strong>X (Twitter):</strong> Display names, user handles, and tweets.</li>
              <li><strong>YouTube:</strong> Channel titles, video descriptions, and community posts.</li>
              <li><strong>Gaming Platforms:</strong> Steam profiles, Roblox handles, and online leaderboards.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="border border-[#27272a] bg-[#121215] p-5 rounded-lg space-y-2">
              <h3 className="font-display text-base text-[#f4f4f5] uppercase">Fancy Fonts for Instagram</h3>
              <p className="text-xs text-[#a1a1aa]">
                Stand out on Instagram with aesthetic cursive bios, bold profile names, and small caps highlights.
              </p>
            </div>
            <div className="border border-[#27272a] bg-[#121215] p-5 rounded-lg space-y-2">
              <h3 className="font-display text-base text-[#f4f4f5] uppercase">Fancy Fonts for TikTok</h3>
              <p className="text-xs text-[#a1a1aa]">
                Catch attention in TikTok video captions and comments with bubble letters and dark enclosed text.
              </p>
            </div>
            <div className="border border-[#27272a] bg-[#121215] p-5 rounded-lg space-y-2">
              <h3 className="font-display text-base text-[#f4f4f5] uppercase">Fancy Fonts for Discord</h3>
              <p className="text-xs text-[#a1a1aa]">
                Customize your Discord nickname and channel titles with gothic fraktur and underlined Unicode.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t border-[#27272a] pt-12">
          <FaqSection faqs={faqs} />
        </section>
      </main>
    </div>
  );
}
