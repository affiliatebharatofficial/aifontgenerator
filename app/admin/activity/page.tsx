import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Activity Logs — Admin Control',
  robots: { index: false, follow: false },
};

export default async function AdminActivityPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: rawLogs } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const logs = rawLogs ?? [];

  return (
    <div className="space-y-8 font-mono text-xs text-slate-300">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
          <Activity className="w-3.5 h-3.5" />
          <span>AUDIT TRAIL LOGS</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 uppercase font-display">
          ADMIN ACTIVITY LOGS
        </h1>
        <p className="text-xs text-slate-400">
          Real audit trail of administrator setting updates, feature toggles, role changes, and system operations.
        </p>
      </div>

      <div className="border border-slate-800 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Type</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No admin activity logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-950/30">
                    <td className="p-4 text-slate-400 shrink-0 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-rose-400 uppercase">{l.action}</td>
                    <td className="p-4 text-slate-300">{l.target_type || '—'}</td>
                    <td className="p-4 text-slate-300 font-bold">{l.target_id || '—'}</td>
                    <td className="p-4 text-slate-400 truncate max-w-xs">
                      {JSON.stringify(l.metadata || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
