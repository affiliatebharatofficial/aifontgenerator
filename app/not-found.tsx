import Link from 'next/link';
import { Type, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 font-mono">
        <div className="w-20 h-20 rounded-2xl bg-[#e05638]/10 border border-[#e05638]/30 flex items-center justify-center text-[#e05638] font-bold text-3xl shadow-xl">
          404
        </div>

        <div className="space-y-3 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#e05638] bg-[#e05638]/10 border border-[#e05638]/30 px-3 py-1 rounded-full">
            GLYPH NOT FOUND
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-5xl text-[#f4f4f5] tracking-tight uppercase">
            PAGE NOT FOUND
          </h1>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            The typographic route or specimen you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer"
          >
            <Type className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#27272a] bg-[#121215] text-[#f4f4f5] hover:border-[#e05638] transition-colors font-bold text-xs uppercase cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Font Generator</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
