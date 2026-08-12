import Link from 'next/link';
import { ArrowRight, Type, Copy, FileCode2, CheckCircle2 } from 'lucide-react';

export function FancyVsRealFontSection() {
  return (
    <section className="w-full border border-[#27272a] bg-[#121215] rounded-xl p-6 sm:p-10 space-y-8 my-12">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
          TYPOGRAPHY ARCHITECTURE
        </span>
        <h2 className="font-display font-normal text-2xl sm:text-4xl text-[#f4f4f5] tracking-tight uppercase">
          Fancy Text vs. Real Font Files
        </h2>
        <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
          Understanding the technical difference between Unicode copy-paste text and installable vector font binaries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product 2 Card: Fancy Font Generator */}
        <div className="border border-[#27272a] bg-[#18181b] p-6 rounded-lg space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#27272a] flex items-center justify-center text-[#e05638]">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#a1a1aa] tracking-widest font-semibold block">
                TOOL 1 — THIS PAGE
              </span>
              <h3 className="font-display text-lg text-[#f4f4f5] uppercase">Fancy Font Generator</h3>
            </div>
          </div>

          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Transforms standard Latin input into mathematical Unicode code points (such as Fraktur, Small Caps, or Double Struck).
          </p>

          <ul className="space-y-2 text-xs text-[#d4d4d8]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Copy and paste directly into Instagram, TikTok, Discord</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% Free with zero API or server requests</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No software installation required</span>
            </li>
          </ul>
        </div>

        {/* Product 1 Card: AI Font Generator */}
        <div className="border border-[#e05638]/40 bg-[#18181b] p-6 rounded-lg space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#e05638]/10 border border-[#e05638]/30 flex items-center justify-center text-[#e05638]">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#e05638] tracking-widest font-semibold block">
                TOOL 2 — AI TYPE SYNTHESIS
              </span>
              <h3 className="font-display text-lg text-[#f4f4f5] uppercase">AI Font Generator</h3>
            </div>
          </div>

          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            Uses AI neural models to generate complete vector glyph sets and output real font files (`TTF`, `OTF`, `WOFF2`).
          </p>

          <ul className="space-y-2 text-xs text-[#d4d4d8]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#e05638] shrink-0" />
              <span>Installable on macOS, Windows, iOS & Android</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#e05638] shrink-0" />
              <span>Use in Photoshop, Figma, Word, & Web Development</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#e05638] shrink-0" />
              <span>Full vector OpenType font binaries</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Conversion Banner */}
      <div className="pt-4 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display text-base text-[#f4f4f5] uppercase">Want a real font file?</h4>
          <p className="text-xs text-[#a1a1aa]">
            Turn your typography prompts into a downloadable, production-ready typeface.
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-xs font-mono uppercase font-bold tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md shrink-0"
        >
          <Type className="w-4 h-4" />
          <span>Create a Real Font</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
