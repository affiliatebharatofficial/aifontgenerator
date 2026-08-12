import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <p className="text-xs text-slate-400 font-medium">Loading AI Font Generator studio...</p>
    </div>
  );
}
