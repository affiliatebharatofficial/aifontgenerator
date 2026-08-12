import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { getGenerationStatus } from '@/lib/generations/service';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Generation Status — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GenerationStatusPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/generate/status/${generationId}`);
  }

  let generation = await getGenerationStatus(generationId, user.id);

  if (!generation) {
    notFound();
  }

  // If job is pending or processing, execute processJob server-side to guarantee completion
  if (generation.status === 'pending' || generation.status === 'processing') {
    const { GenerationJobService } = await import('@/lib/font/generation/jobProcessor');
    await GenerationJobService.processJob(generationId);
    generation = await getGenerationStatus(generationId, user.id);
  }

  if (generation && generation.status === 'completed') {
    redirect(`/font/${generation.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        <div>
          <Link
            href="/dashboard/my-fonts"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Fonts</span>
          </Link>
        </div>

        {/* Status Header Card */}
        <div className="border border-[#27272a] bg-[#121215] rounded-md p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272a]">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
                GENERATION JOB STATUS
              </span>
              <h1 className="font-display font-normal text-3xl text-[#f4f4f5] uppercase">
                {generation.font_name || 'AIFont'}
              </h1>
            </div>

            <span
              className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
                generation.status === 'failed'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
              }`}
            >
              {generation.status}
            </span>
          </div>

          {/* Status Details */}
          {generation.status === 'pending' && (
            <div className="p-6 rounded-md bg-[#09090b] border border-[#27272a] space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Job Queued</span>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed">
                Your font generation request is queued for vector glyph outline synthesis.
              </p>
            </div>
          )}

          {generation.status === 'processing' && (
            <div className="p-6 rounded-md bg-[#09090b] border border-[#27272a] space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#e05638] font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-[#e05638]" />
                <span>Synthesizing Bezier Outlines...</span>
              </div>
              <p className="text-[#a1a1aa] leading-relaxed">
                Our AI engine is processing Latin uppercase, lowercase, digits, and compiling OpenType sfnt tables.
              </p>
            </div>
          )}

          {generation.status === 'failed' && (
            <div className="p-6 rounded-md bg-rose-950/60 border border-rose-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Generation Failed</span>
              </div>
              <p className="text-rose-200 leading-relaxed">
                {generation.error_message || 'An unexpected error occurred during font synthesis.'}
              </p>
            </div>
          )}

          {/* Parameters Table */}
          <div className="pt-4 border-t border-[#27272a] font-mono text-xs text-[#a1a1aa] space-y-2">
            <span className="text-[10px] uppercase text-[#71717a] font-bold block">PROMPT PARAMETERS</span>
            <p className="text-[#f4f4f5] italic">&ldquo;{generation.prompt}&rdquo;</p>
            <div className="flex flex-wrap gap-4 text-[11px] pt-2">
              <span>Category: <strong className="text-[#f4f4f5]">{generation.category}</strong></span>
              <span>Weight: <strong className="text-[#f4f4f5]">{generation.weight}</strong></span>
              <span>Width: <strong className="text-[#f4f4f5]">{generation.width}</strong></span>
              <span>Style: <strong className="text-[#f4f4f5]">{generation.style}</strong></span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
