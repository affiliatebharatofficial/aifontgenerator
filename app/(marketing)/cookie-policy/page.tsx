import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Cookie Policy — AI Font Generator',
  description:
    'Learn how AI Font Generator uses cookies for user authentication, session security, performance monitoring, and advertising.',
  path: '/cookie-policy',
});

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-10">
        <Breadcrumbs items={[{ name: 'Cookie Policy', href: '/cookie-policy' }]} />

        <div className="space-y-3 border-b border-[#27272a] pb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            PRIVACY & COOKIES
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] uppercase tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-xs font-mono text-[#71717a]">Last Updated: August 12, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[#a1a1aa] leading-relaxed space-y-6">
          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored in your web browser by websites you visit. They allow websites to remember user preferences, maintain active login sessions, and analyze traffic performance.
          </p>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">2. Cookies We Use</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Essential Session Cookies:</strong> Required for user authentication, security tokens, and user workspace navigation.</li>
            <li><strong>Preference Cookies:</strong> Remember your selected generator parameters and UI settings.</li>
            <li><strong>Advertising & Analytics Cookies:</strong> Placed by third-party services (such as Google AdSense, when enabled) to measure ad impressions and site traffic metrics.</li>
          </ul>

          <h2 className="font-display text-xl text-[#f4f4f5] uppercase">3. Managing Cookie Preferences</h2>
          <p>
            You can configure your browser settings to block or delete cookies at any time. Note that disabling essential cookies may prevent logging into your account or generating fonts.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
