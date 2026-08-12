import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { HardDrive, Download, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { GeneratedFile } from '@/types/database';

export const metadata: Metadata = {
  title: 'Storage Utilization — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminStoragePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rawFiles } = await supabase
    .from('generated_files')
    .select('*');

  const files = (rawFiles as GeneratedFile[] | null) ?? [];

  const totalFiles = files.length;
  const totalSizeBytes = files.reduce((acc, f) => acc + Number(f.file_size || 0), 0);
  const totalDownloads = files.reduce((acc, f) => acc + Number(f.download_count || 0), 0);

  const ttfFiles = files.filter((f) => f.format === 'ttf');
  const otfFiles = files.filter((f) => f.format === 'otf');
  const woff2Files = files.filter((f) => f.format === 'woff2');

  const ttfSize = ttfFiles.reduce((acc, f) => acc + Number(f.file_size || 0), 0);
  const otfSize = otfFiles.reduce((acc, f) => acc + Number(f.file_size || 0), 0);
  const woff2Size = woff2Files.reduce((acc, f) => acc + Number(f.file_size || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Storage Utilization & Files
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Real binary font storage metrics calculated live from Supabase Storage records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Compiled Binaries</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2 font-mono">{totalFiles}</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Storage Used</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2 font-mono">
            {(totalSizeBytes / (1024 * 1024)).toFixed(2)} <span className="text-xs text-slate-400 font-normal">MB</span>
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Binary Downloads</span>
            <Download className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-2 font-mono">{totalDownloads}</p>
        </Card>
      </div>

      {/* Format Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Format Breakdown</span>
          </CardTitle>
          <CardDescription>File count and storage distribution across TTF, OTF, and WOFF2 formats.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold uppercase">TrueType (.ttf)</span>
              <p className="text-slate-200 text-base font-bold">{ttfFiles.length} Files</p>
              <p className="text-slate-400">{(ttfSize / 1024).toFixed(1)} KB Total</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold uppercase">OpenType (.otf)</span>
              <p className="text-slate-200 text-base font-bold">{otfFiles.length} Files</p>
              <p className="text-slate-400">{(otfSize / 1024).toFixed(1)} KB Total</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold uppercase">Web Open Font (.woff2)</span>
              <p className="text-slate-200 text-base font-bold">{woff2Files.length} Files</p>
              <p className="text-slate-400">{(woff2Size / 1024).toFixed(1)} KB Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
