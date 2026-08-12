import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { UploadCloud, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ImportFontDropzone } from '@/components/font/importer/ImportFontDropzone';

export const metadata: Metadata = {
  title: 'Import a Typeface — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ImportFontPage() {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/import-font');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        <div>
          <Link
            href="/dashboard/library"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Type Library</span>
          </Link>
        </div>

        {/* Page Title Header */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>PRIVATE FONT WORKSPACE</span>
          </div>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase">
            IMPORT A TYPEFACE
          </h1>
          <p className="text-xs font-mono text-[#a1a1aa] leading-relaxed">
            Bring an existing font into your private workspace and inspect its structure, metadata, and glyph coverage.
          </p>
        </div>

        {/* Drag & Drop Import Component */}
        <ImportFontDropzone />
      </main>

      <Footer />
    </div>
  );
}
