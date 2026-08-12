'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error internally without exposing details to user UI
    console.error('Unhandled application error:', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 font-mono bg-[#09090b] text-[#f4f4f5]">
      <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-xl">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-3 max-w-md">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/40 border border-amber-800/60 px-3 py-1 rounded-full">
          SYSTEM ERROR
        </span>
        <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#f4f4f5] tracking-tight uppercase">
          SOMETHING WENT WRONG
        </h1>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          An unexpected error occurred while processing your request. Please try reloading or return to the homepage.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#27272a] bg-[#121215] text-[#f4f4f5] hover:border-[#e05638] transition-colors font-bold text-xs uppercase cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
