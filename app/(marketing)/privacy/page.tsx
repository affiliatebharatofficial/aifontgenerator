import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy — AI Font Generator',
  description:
    'Learn how AI Font Generator collects, processes, and protects user account information, AI generation requests, and cookie data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-10">
        <Breadcrumbs items={[{ name: 'Privacy Policy', href: '/privacy' }]} />

        <div className="space-y-3 border-b border-[#27272a] pb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            LEGAL COMPLIANCE
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] uppercase tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-[#71717a]">Last Updated: August 12, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#a1a1aa] leading-relaxed space-y-6">
          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">1. Information We Collect</h2>
          <p>
            When you register an account or generate custom typefaces on <strong>ai-fontgenerator.com</strong>, we collect necessary operating data including:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Account Data:</strong> Email address and authentication credentials stored securely via Supabase Auth.</li>
            <li><strong>Generation Parameters:</strong> Text prompts, category selections, weight/width parameters, and generated font binary files.</li>
            <li><strong>Technical Analytics:</strong> IP address, user agent, browser session cookies, and daily usage request counts.</li>
          </ul>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">2. How We Use Information</h2>
          <p>
            We process your information to provide our core type design services, enforce daily quota limits, manage server infrastructure, and transmit text prompt parameters to configured AI provider models (e.g. OpenAI, Anthropic, Gemini, DeepSeek).
          </p>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">3. Data Storage & Security</h2>
          <p>
            User credentials and database records are hosted on PostgreSQL infrastructure managed via Supabase with Row Level Security (RLS) policies. Generated font files (.ttf, .otf, .woff2) are stored in secure Supabase Storage buckets.
          </p>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">4. Cookies & Advertising</h2>
          <p>
            We use essential HTTP session cookies for user authentication and state management. Third-party advertising partners (such as Google AdSense, when enabled) may place cookies to serve ads based on user visits.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
