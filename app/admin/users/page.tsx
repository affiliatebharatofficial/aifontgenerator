import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Users, Search, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserRoleButton } from './UserRoleButton';
import type { Profile, UserRole } from '@/types/database';

export const metadata: Metadata = {
  title: 'User Management — Admin Panel',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  await requireAdmin();
  const resolvedParams = await searchParams;

  const search = resolvedParams.search || '';
  const roleFilter = resolvedParams.role || 'all';
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10));
  const pageSize = 10;

  const supabase = await createClient();

  let query = supabase.from('profiles').select('*', { count: 'exact' });

  if (roleFilter !== 'all') {
    query = query.eq('role', roleFilter);
  }

  if (search.trim().length > 0) {
    const s = `%${search.trim()}%`;
    query = query.or(`email.ilike.${s},full_name.ilike.${s}`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: rawProfiles, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  const profiles = (rawProfiles as Profile[] | null) ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            View registered user profiles, manage administrative access privileges, and inspect accounts.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Registered User Directory ({totalCount})</span>
              </CardTitle>
              <CardDescription>Accounts stored in Supabase authentication tables.</CardDescription>
            </div>

            {/* Search & Role Filter Form */}
            <form method="get" className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search user or email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                name="role"
                defaultValue={roleFilter}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User Role</option>
                <option value="admin">Admin Role</option>
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
          {profiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No registered user profiles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-500">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Role Action</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">
                            {p.full_name || 'No Name Provided'}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">{p.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            p.role === 'admin'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {p.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <UserRoleButton userId={p.id} currentRole={p.role as UserRole} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/users/${p.id}`}
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Page {page} of {totalPages} ({totalCount} users)
              </span>

              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/users?page=${page - 1}&search=${encodeURIComponent(search)}&role=${roleFilter}`}
                    className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/users?page=${page + 1}&search=${encodeURIComponent(search)}&role=${roleFilter}`}
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
