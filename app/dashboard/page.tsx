import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { DAILY_GENERATION_LIMIT } from '@/lib/generations/constants';
import { ArrowRight } from 'lucide-react';
import type { FontGeneration } from '@/types/database';

export const metadata: Metadata = {
  title: 'Workspace — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const { user } = await getCurrentUserProfile();

  if (!user) return null;

  const supabase = await createClient();

  // Fetch real font_generations records for authenticated user
  const { data: rawGenerations } = await supabase
    .from('font_generations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  let generations = (rawGenerations as unknown as FontGeneration[]) ?? [];

  const pendingJobs = generations.filter(
    (g) => g.status === 'pending' || g.status === 'processing'
  );

  if (pendingJobs.length > 0) {
    try {
      const { GenerationJobService } = await import('@/lib/font/generation/jobProcessor');
      await Promise.all(pendingJobs.map((j) => GenerationJobService.processJob(j.id)));

      const { data: refreshed } = await supabase
        .from('font_generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (refreshed) {
        generations = (refreshed as unknown as FontGeneration[]) ?? [];
      }
    } catch (err) {
      console.error('Auto-processing dashboard pending fonts failed:', err);
    }
  }

  const totalCount = generations.length;
  const completedCount = generations.filter((g) => g.status === 'completed').length;
  const processingCount = generations.filter((g) => g.status === 'processing' || g.status === 'pending').length;
  const failedCount = generations.filter((g) => g.status === 'failed').length;

  // Fetch daily usage count
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: usageData } = await supabase
    .from('generation_usage')
    .select('generation_count')
    .eq('user_id', user.id)
    .eq('usage_date', todayStr)
    .single();

  const todayUsage = usageData?.generation_count ?? 0;
  const recentGenerations = generations.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            TYPE DESIGN STUDIO
          </span>
          <h1 className="font-display font-normal text-3xl sm:text-5xl text-[#f4f4f5] tracking-tight uppercase">
            YOUR FONT WORKSPACE
          </h1>
        </div>

        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#e05638] hover:bg-[#c84326] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm self-start sm:self-auto"
        >
          <span>Create New Font</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quota & Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 border border-[#27272a] bg-[#121215] rounded-md space-y-1">
          <span className="text-[#71717a] uppercase text-[10px]">DAILY ALLOWANCE</span>
          <p className="text-xl font-bold text-[#f4f4f5]">
            {todayUsage} / {DAILY_GENERATION_LIMIT} Used
          </p>
        </div>

        <div className="p-4 border border-[#27272a] bg-[#121215] rounded-md space-y-1">
          <span className="text-[#71717a] uppercase text-[10px]">TOTAL CREATED</span>
          <p className="text-xl font-bold text-[#f4f4f5]">{totalCount}</p>
        </div>

        <div className="p-4 border border-[#27272a] bg-[#121215] rounded-md space-y-1">
          <span className="text-[#71717a] uppercase text-[10px]">COMPLETED</span>
          <p className="text-xl font-bold text-emerald-400">{completedCount}</p>
        </div>

        <div className="p-4 border border-[#27272a] bg-[#121215] rounded-md space-y-1">
          <span className="text-[#71717a] uppercase text-[10px]">IN PROGRESS / FAILED</span>
          <p className="text-xl font-bold text-[#f4f4f5]">
            {processingCount} / <span className="text-rose-400">{failedCount}</span>
          </p>
        </div>
      </div>

      {/* Recent Typefaces Showcase */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
            RECENT TYPEFACES
          </h2>
          <Link
            href="/dashboard/my-fonts"
            className="text-xs font-mono text-[#e05638] hover:underline uppercase font-bold"
          >
            View All ({totalCount}) →
          </Link>
        </div>

        {recentGenerations.length === 0 ? (
          <div className="border border-[#27272a] bg-[#121215] rounded-md p-12 text-center space-y-4">
            <h3 className="font-display font-normal text-3xl text-[#f4f4f5]">No Typefaces Created Yet</h3>
            <p className="text-xs text-[#71717a] max-w-md mx-auto">
              Start by describing a visual style, stroke weight, or mood to synthesize your first custom font.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#e05638] hover:bg-[#c84326] text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              <span>Synthesize Your First Font</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentGenerations.map((g) => (
              <div
                key={g.id}
                className="border border-[#27272a] bg-[#121215] rounded-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#3f3f46] transition-all"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-normal text-2xl text-[#f4f4f5] truncate">
                      {g.font_name || 'AIFont'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        g.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : g.status === 'failed'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#71717a] font-mono truncate max-w-xl">{g.prompt}</p>

                  <div className="text-[10px] font-mono text-[#a1a1aa] flex items-center gap-3">
                    <span>{g.category}</span>
                    <span>•</span>
                    <span>{g.weight}</span>
                    <span>•</span>
                    <span>{new Date(g.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {g.status === 'completed' ? (
                    <Link
                      href={`/font/${g.id}`}
                      className="px-4 py-2 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#f4f4f5] text-xs font-mono font-bold uppercase rounded-md transition-colors"
                    >
                      Specimen & Download →
                    </Link>
                  ) : (
                    <Link
                      href={`/generate/status/${g.id}`}
                      className="px-4 py-2 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs font-mono font-bold uppercase rounded-md"
                    >
                      View Status →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
