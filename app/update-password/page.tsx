'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, AlertCircle, Loader2, Check } from 'lucide-react';
import { updatePasswordAction } from '@/lib/auth/actions';

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updatePasswordAction(formData);

    if (result && !result.success) {
      setLoading(false);
      setError(result.error || 'Failed to update password. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#09090b] text-[#f4f4f5] font-mono">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg text-[#f4f4f5]">
            <div className="w-8 h-8 rounded-lg bg-[#e05638] flex items-center justify-center text-white font-mono text-sm">
              F
            </div>
            <span className="font-display uppercase tracking-tight">AI FONT GENERATOR</span>
          </Link>

          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-bold uppercase font-display text-[#f4f4f5]">
              SET NEW PASSWORD
            </h1>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Enter your new account password below to complete the reset.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[10px] uppercase font-bold text-[#a1a1aa]">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#f4f4f5] text-xs font-mono outline-none focus:border-[#e05638] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-[10px] uppercase font-bold text-[#a1a1aa]">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#f4f4f5] text-xs font-mono outline-none focus:border-[#e05638] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
