import type { Metadata } from 'next';
import Link from 'next/link';
import { TemplateDownloadButton } from '@/components/font/handwriting/TemplateDownloadButton';
import {
  Sparkles,
  PenTool,
  UploadCloud,
  CheckCircle2,
  Sliders,
  FileCode2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Handwriting Font Generator — Turn Your Handwriting into a Font',
  description:
    'Turn your own handwriting into a custom OpenType font. Upload a handwriting sample, detect characters, vectorize stroke contours, and download production TTF, OTF, and WOFF2 fonts.',
  keywords: [
    'handwriting font generator',
    'turn handwriting into font',
    'create font from handwriting',
    'custom handwriting typeface',
    'handwritten font creator',
  ],
};

export default function HandwritingFontGeneratorPage() {
  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#e05638]/10 text-[#e05638] border border-[#e05638]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PERSONAL TYPEFACE CREATOR</span>
          </div>

          <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase max-w-4xl mx-auto leading-tight">
            TURN YOUR HANDWRITING INTO A FONT
          </h1>

          <p className="text-base sm:text-xl text-[#a1a1aa] font-mono max-w-2xl mx-auto leading-relaxed">
            Upload a clear handwriting sample and transform your unique letterforms into a fully functioning vector font.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/handwriting-to-font"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-xl cursor-pointer"
            >
              <span>Create Handwriting Font</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <TemplateDownloadButton />
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-[#27272a] bg-[#121215] rounded-xl p-8 space-y-4 font-mono text-xs text-[#a1a1aa]">
              <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-center text-[#e05638]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#f4f4f5] uppercase tracking-wide">
                1. Upload &amp; Analyze
              </h3>
              <p className="text-[#71717a] leading-relaxed">
                Upload a photo or scan of your handwriting. Our segmentation engine isolates individual character strokes and maps them to Unicode code points.
              </p>
            </div>

            <div className="border border-[#27272a] bg-[#121215] rounded-xl p-8 space-y-4 font-mono text-xs text-[#a1a1aa]">
              <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-center text-[#e05638]">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#f4f4f5] uppercase tracking-wide">
                2. Review &amp; Vectorize
              </h3>
              <p className="text-[#71717a] leading-relaxed">
                Inspect detected character crops, adjust Unicode labels, and convert stroke bitmaps into clean OpenType vector contour curves.
              </p>
            </div>

            <div className="border border-[#27272a] bg-[#121215] rounded-xl p-8 space-y-4 font-mono text-xs text-[#a1a1aa]">
              <div className="w-12 h-12 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-center text-[#e05638]">
                <FileCode2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#f4f4f5] uppercase tracking-wide">
                3. Test &amp; Download
              </h3>
              <p className="text-[#71717a] leading-relaxed">
                Test your finished handwriting font in our Phase 9 Font Testing Studio and download ready-to-use TTF, OTF, and WOFF2 font files.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#27272a] bg-[#121215] rounded-2xl p-8 sm:p-14 space-y-8 font-mono text-xs text-[#a1a1aa]">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#e05638] uppercase tracking-widest block">
                WHY USE OUR HANDWRITING GENERATOR
              </span>
              <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#f4f4f5] tracking-tight uppercase">
                PRODUCTION OPENTYPE QUALITY FOR YOUR PERSONAL HANDWRITING
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <span className="text-[#f4f4f5] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Real Vector Outlines</span>
                </span>
                <p className="text-[11px] text-[#71717a]">
                  Generates scalable OpenType bezier paths, not embedded raster images.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[#f4f4f5] font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Private &amp; Secure</span>
                </span>
                <p className="text-[11px] text-[#71717a]">
                  Your handwriting samples remain strictly private to your account.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[#f4f4f5] font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Testing</span>
                </span>
                <p className="text-[11px] text-[#71717a]">
                  Test your handwriting font specimen with live tracking and leading.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[#f4f4f5] font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Instant Formats</span>
                </span>
                <p className="text-[11px] text-[#71717a]">
                  Get compiled TrueType (.ttf), OpenType (.otf), and WOFF2 web fonts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Bottom Section */}
        <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-display font-normal text-3xl sm:text-5xl text-[#f4f4f5] tracking-tight uppercase">
            READY TO CREATE YOUR OWN HANDWRITING TYPEFACE?
          </h2>
          <p className="text-sm font-mono text-[#a1a1aa]">
            Start now by uploading a handwriting sample or downloading our sample template sheet.
          </p>
          <div>
            <Link
              href="/handwriting-to-font"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#e05638] hover:bg-[#c8462a] text-white font-mono font-bold text-sm uppercase tracking-wider transition-all shadow-xl cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
    </div>
  );
}
