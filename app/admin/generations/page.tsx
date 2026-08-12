import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FolderKanban, Search, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { FontGeneration } from '@/types/database';

export const metadata: Metadata = {
  title: 'Generations Management — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminGenerationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();
  const resolvedParams = await searchParams;

  const search = resolvedParams.search || '';
  const statusFilter = resolvedParams.status || 'all';
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10));
  const pageSize = 12;

  const supabase = await createClient();

  let query = supabase.from('font_generations').select('*', { count: 'exact' });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (search.trim().length > 0) {
    const s = `%${search.trim()}%`;
    query = query.or(`font_name.ilike.${s},prompt.ilike.${s},id.ilike.${s}`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: rawGenerations, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  const generations = (rawGenerations as unknown as FontGeneration[]) ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Font Generation Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor real-time AI vector synthesis jobs, error states, and execution metrics.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-indigo-400" />
                <span>Job Queue Directory ({totalCount})</span>
              </CardTitle>
              <CardDescription>Generation records stored in font_generations table.</CardDescription>
            </div>

            <form method="get" className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search by ID, name, prompt..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                name="status"
                defaultValue={statusFilter}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Filter
              </button>
            </form>
          </div>
        </CardHeader>

        <CardContent>
          {generations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No font generation jobs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3 px-4">Font Name / ID</th>
                    <th className="py-3 px-4">Category & Weight</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {generations.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">
                            {g.font_name || 'AI Font'}
                          </span>
                          <span className="font-mono text-slate-500 text-[10px] truncate max-w-xs">
                            {g.id}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium">
                          {g.category} • {g.weight}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
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
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(g.created_at).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/generations/${g.id}`}
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Page {page} of {totalPages} ({totalCount} jobs)
              </span>

              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/generations?page=${page - 1}&search=${encodeURIComponent(search)}&status=${statusFilter}`}
                    className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/generations?page=${page + 1}&search=${encodeURIComponent(search)}&status=${statusFilter}`}
                    className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
