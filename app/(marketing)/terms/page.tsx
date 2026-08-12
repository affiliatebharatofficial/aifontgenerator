import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Service — AI Font Generator',
  description:
    'Read the terms of service governing user accounts, font generation usage, platform rules, and content intellectual property rights on ai-fontgenerator.com.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-10">
        <Breadcrumbs items={[{ name: 'Terms of Service', href: '/terms' }]} />

        <div className="space-y-3 border-b border-[#27272a] pb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            LEGAL AGREEMENT
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] uppercase tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs font-mono text-[#71717a]">Last Updated: August 12, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#a1a1aa] leading-relaxed space-y-6">
          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">1. Platform Usage & Account Rules</h2>
          <p>
            By accessing <strong>ai-fontgenerator.com</strong>, you agree to comply with applicable laws and platform rules. You are responsible for maintaining the confidentiality of your account credentials. Automated scraping or abusing generation quota endpoints is strictly prohibited.
          </p>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">2. Generated Font Licensing & Rights</h2>
          <p>
            You are granted the right to use font binaries synthesized through your account for personal and commercial graphics, web applications, and digital products. However, because generative AI models construct vector glyphs from text prompts:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>We do not guarantee trademark availability or legal exclusivity for generated typefaces.</li>
            <li>Users remain responsible for performing legal clearance prior to trademarking logos created with generated fonts.</li>
          </ul>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">3. Limitation of Liability</h2>
          <p>
            The platform and AI generation engine are provided &quot;AS IS&quot; without warranties of any kind. AI Font Generator shall not be held liable for any damages resulting from system downtime, font file rendering variations, or third-party intellectual property disputes.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
