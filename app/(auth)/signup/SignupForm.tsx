'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { signupAction } from '@/lib/auth/actions';

export function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await signupAction(formData);
      if (res && !res.success) {
        setError(res.error || 'Failed to create account.');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'digest' in err) {
        throw err;
      }
      setError('An error occurred during account registration.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border border-[#27272a] bg-[#121215] rounded-md p-8 space-y-6">
      <div className="space-y-1 text-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e05638] font-bold">
          NEW USER REGISTRATION
        </span>
        <h1 className="font-display font-normal text-3xl text-[#f4f4f5] uppercase">Create Account</h1>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-md bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div className="space-y-1.5">
          <label className="block text-[#a1a1aa] uppercase text-[11px] font-semibold">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#a1a1aa] uppercase text-[11px] font-semibold">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[#a1a1aa] uppercase text-[11px] font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-[#f4f4f5] focus:outline-none focus:border-[#e05638]"
          />
          <p className="text-[10px] text-[#71717a]">Must be at least 6 characters</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#e05638] hover:bg-[#c84326] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          <span>Create Account</span>
        </button>
      </form>

      <div className="pt-4 border-t border-[#27272a] text-center text-xs font-mono text-[#a1a1aa]">
        <span>Already have an account? </span>
        <Link href="/login" className="text-[#e05638] font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
