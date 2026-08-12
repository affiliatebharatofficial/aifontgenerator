import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { ClipboardList } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Audit Logs — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLogsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rawLogs } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const logs =
    (rawLogs as unknown as Array<{
      id: string;
      admin_user_id: string;
      action: string;
      target_type: string | null;
      target_id: string | null;
      metadata: Record<string, unknown> | null;
      created_at: string;
    }>) ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Administrative Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Stream of real administrative control actions recorded in admin_activity_logs table.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-400" />
            <span>Recent System Activity Logs ({logs.length})</span>
          </CardTitle>
          <CardDescription>Actions performed by authenticated site administrators.</CardDescription>
        </CardHeader>

        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No administrative activity logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Admin User ID</th>
                    <th className="py-3 px-4">Target Type & ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-indigo-400">{log.action}</td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[140px]">
                        {log.admin_user_id}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.target_type || 'system'} {log.target_id ? `(${log.target_id})` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
