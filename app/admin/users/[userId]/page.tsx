import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserRoleButton } from '../UserRoleButton';
import type { Profile, UserRole, FontGeneration } from '@/types/database';

export const metadata: Metadata = {
  title: 'User Details — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const supabase = await createClient();

  // Fetch target profile
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const profile = rawProfile as Profile | null;

  if (!profile) {
    notFound();
  }

  // Fetch target user's generations
  const { data: rawGenerations } = await supabase
    .from('font_generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const generations = (rawGenerations as unknown as FontGeneration[]) ?? [];

  const completedCount = generations.filter((g) => g.status === 'completed').length;
  const failedCount = generations.filter((g) => g.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to User Directory</span>
        </Link>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-500 font-semibold">User Details</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              {profile.full_name || 'No Name Provided'}
            </h1>
            <p className="font-mono text-xs text-indigo-400">{profile.email}</p>
          </div>

          <UserRoleButton userId={profile.id} currentRole={profile.role as UserRole} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-950 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Generations</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2 font-mono">{generations.length}</p>
          </Card>

          <Card className="p-4 bg-slate-950 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium font-mono">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{completedCount}</p>
          </Card>

          <Card className="p-4 bg-slate-950 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Failed</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400 mt-2 font-mono">{failedCount}</p>
          </Card>
        </div>

        {/* User Generation History */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">
              User Font Generations ({generations.length})
            </CardTitle>
            <CardDescription>Real font generation jobs submitted by this user.</CardDescription>
          </CardHeader>
          <CardContent>
            {generations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">User has zero font generations.</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {generations.map((g) => (
                  <div key={g.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-semibold text-slate-200 block truncate">
                        {g.font_name || 'AI Font'}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate">{g.prompt}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
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
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(g.created_at).toLocaleDateString()}
                      </span>
                    </div>
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
