import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { FontGeneration, GeneratedFile } from '@/types/database';

export const metadata: Metadata = {
  title: 'Generation Inspection — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminGenerationDetailPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  await requireAdmin();
  const { generationId } = await params;
  const supabase = await createClient();

  const { data: rawGen } = await supabase
    .from('font_generations')
    .select('*')
    .eq('id', generationId)
    .single();

  const generation = rawGen as unknown as FontGeneration | null;

  if (!generation) {
    notFound();
  }

  const { data: filesData } = await supabase
    .from('generated_files')
    .select('*')
    .eq('generation_id', generationId);

  const files = (filesData as GeneratedFile[] | null) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin/generations"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Generations</span>
        </Link>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Job ID</span>
            <h1 className="text-xl font-bold font-mono text-slate-100 break-all">{generation.id}</h1>
          </div>

          <span
            className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
              generation.status === 'completed'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : generation.status === 'failed'
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {generation.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Font Name</span>
            <p className="font-semibold text-slate-200">{generation.font_name || 'N/A'}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Category & Specs</span>
            <p className="font-semibold text-slate-200">
              {generation.category} • {generation.weight} • {generation.width} • {generation.style}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
            <span className="text-slate-500">Prompt Description</span>
            <p className="text-slate-200 leading-relaxed font-mono">{generation.prompt}</p>
          </div>

          {generation.error_message && (
            <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 space-y-1 sm:col-span-2 text-rose-300">
              <span className="font-semibold">Engine Failure Log</span>
              <p className="font-mono text-[11px] break-all">{generation.error_message}</p>
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">User ID</span>
            <p className="font-mono text-[11px] text-slate-300 break-all">{generation.user_id}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500">Created Date</span>
            <p className="font-mono text-[11px] text-slate-300">
              {new Date(generation.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Compiled Binary Files Table */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Compiled Format Binaries ({files.length})</span>
            </CardTitle>
            <CardDescription>Records in public.generated_files table.</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No compiled binary files exist for this job.</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs font-mono">
                {files.map((f) => (
                  <div key={f.id} className="py-3 flex items-center justify-between gap-3">
                    <span className="font-bold text-indigo-400 uppercase">.{f.format}</span>
                    <span className="text-slate-400">{f.storage_path}</span>
                    <span className="text-slate-300">{(f.file_size / 1024).toFixed(1)} KB</span>
                    <span className="text-slate-500">{f.download_count} downloads</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
