import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { constructMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/marketing/Breadcrumbs';
import { ContactForm } from './ContactForm';
import { Mail, ShieldCheck, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Engineering Support — AI Font Generator',
  description:
    'Get in touch with the AI Font Generator support team for technical inquiries, API feedback, and account support.',
  path: '/contact',
});

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: settingRecord } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'site_info')
    .single();

  const siteInfo = (settingRecord?.value as Record<string, unknown> | null) ?? {};
  const supportEmail = String(siteInfo.supportEmail || 'support@ai-fontgenerator.com');

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        <Breadcrumbs items={[{ name: 'Contact', href: '/contact' }]} />

        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            DIRECT COMMUNICATION
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            Contact Engineering <br />
            <span className="italic text-[#a1a1aa]">& Support Studio.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a1a1aa] font-normal">
            Have a question about vector type synthesis, API provider quotas, or account settings? Send a direct transmission to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Card Panel */}
          <div className="space-y-6 lg:col-span-1">
            <div className="p-6 border border-[#27272a] bg-[#121215] rounded-md space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#e05638] font-bold uppercase">
                <Mail className="w-4 h-4" />
                <span>SUPPORT EMAIL</span>
              </div>
              <p className="text-[#f4f4f5] font-bold break-all">{supportEmail}</p>
              <p className="text-[#71717a] text-[11px] leading-relaxed">
                Configured support channel for technical account inquiries and font binary validation questions.
              </p>
            </div>

            <div className="p-6 border border-[#27272a] bg-[#121215] rounded-md space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#e05638] font-bold uppercase">
                <Clock className="w-4 h-4" />
                <span>RESPONSE TIMELINE</span>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed">
                Inquiries are reviewed by engineering staff within 24 to 48 business hours.
              </p>
            </div>

            <div className="p-6 border border-[#27272a] bg-[#121215] rounded-md space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#e05638] font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>ZERO SPAM PROMISE</span>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed">
                Your contact details are used exclusively to process your support ticket and are never shared with third-party advertisers.
              </p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-2 p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-6">
            <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">Send Message</h2>
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
