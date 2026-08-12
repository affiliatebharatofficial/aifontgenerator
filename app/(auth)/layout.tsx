import Link from 'next/link';
import { Type } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2.5 text-slate-100 hover:text-indigo-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Type className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            AI Font <span className="text-indigo-400 font-normal">Generator</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md">{children}</div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}
