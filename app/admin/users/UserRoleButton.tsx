'use client';

import { useState } from 'react';
import { updateUserRoleAction } from '@/lib/admin/actions';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/types/database';

export function UserRoleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleToggleRole() {
    const nextRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
    setErrorMsg(null);
    setIsUpdating(true);

    try {
      const res = await updateUserRoleAction(userId, nextRole);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update role.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggleRole}
        disabled={isUpdating}
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          currentRole === 'admin'
            ? 'bg-rose-950/80 border border-rose-800/80 text-rose-300 hover:bg-rose-900'
            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900'
        }`}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Shield className="w-3.5 h-3.5" />
        )}
        <span>{currentRole === 'admin' ? 'Demote to User' : 'Promote to Admin'}</span>
      </button>

      {errorMsg && (
        <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMsg}</span>
        </span>
      )}
    </div>
  );
}
