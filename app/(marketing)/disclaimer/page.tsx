import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'AI Disclaimer & Output Policy — AI Font Generator',
  description:
    'Read our AI generation disclaimer detailing output variability, non-guarantee of legal uniqueness, and user responsibilities.',
  path: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-10">
        <Breadcrumbs items={[{ name: 'AI Disclaimer', href: '/disclaimer' }]} />

        <div className="space-y-3 border-b border-[#27272a] pb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            IMPORTANT POLICY NOTICE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] uppercase tracking-tight">
            AI Disclaimer & Non-Guarantee
          </h1>
          <p className="text-xs font-mono text-[#71717a]">Last Updated: August 12, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#a1a1aa] leading-relaxed space-y-6">
          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">1. Nature of Generative AI Output</h2>
          <p>
            Font files generated on <strong>ai-fontgenerator.com</strong> are synthesized by artificial intelligence vector models processing text prompt parameters. AI-generated visual output:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>May vary based on prompt phrasing, AI provider pipeline selection, and seed randomness.</li>
            <li>Should be visually inspected and validated before deploying to commercial production environments.</li>
            <li>May potentially resemble visual style characteristics of historical or existing design traditions.</li>
          </ul>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">2. No Guarantee of Legal Uniqueness or Exclusivity</h2>
          <p>
            AI Font Generator does not provide a blanket legal guarantee that generated font outlines are completely novel or free from third-party trademark or copyright claims. Users retain sole legal responsibility for validating font appropriateness and conducting trademark searches before using generated typefaces in registered logotypes or trademarks.
          </p>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">3. Technical Compatibility Disclaimer</h2>
          <p>
            While our engine compiles standard OpenType sfnt tables (TTF, OTF, WOFF2) validated via automated checks, we do not guarantee bug-free rendering across every legacy software version or custom embedded device.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
