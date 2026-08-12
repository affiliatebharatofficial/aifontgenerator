'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Type, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { requestPasswordResetAction } from '@/lib/auth/actions';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordResetAction(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to send password reset email. Please try again.');
    } else {
      setSuccessMessage('A password reset link has been sent to your email address. Please check your inbox.');
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
              FORGOT PASSWORD
            </h1>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Enter your registered email address and we will send you a link to reset your password.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#121215] border border-[#27272a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-[#f4f4f5] uppercase">RESET LINK SENT</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  {successMessage}
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[10px] uppercase font-bold text-[#a1a1aa]">
                  Account Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] text-[#f4f4f5] text-xs font-mono outline-none focus:border-[#e05638] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[#27272a] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors font-bold uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
