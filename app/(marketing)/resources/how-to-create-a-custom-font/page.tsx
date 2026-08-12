import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/marketing/ArticleLayout';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'How to Create a Custom Font from Scratch',
  description:
    'A comprehensive guide to custom typeface creation, glyph geometry, baseline alignment, and binary sfnt table compilation.',
  path: '/resources/how-to-create-a-custom-font',
});

export default function Article3Page() {
  const related = [
    {
      title: 'TTF vs OTF vs WOFF2: Font File Format Guide',
      href: '/resources/ttf-vs-otf-vs-woff2',
      description: 'Technical comparison of desktop and web font binaries.',
    },
    {
      title: 'How Typography Changes Brand Personality',
      href: '/resources/how-typography-changes-brand-personality',
      description: 'Discover how stem contrast and serif geometry evoke brand trust.',
    },
  ];

  return (
    <ArticleLayout
      title="How to Create a Custom Font from Scratch"
      description="Step-by-step engineering roadmap detailing character grid setup, glyph outline synthesis, kerning pair math, and sfnt binary packaging."
      slug="how-to-create-a-custom-font"
      publishedDate="2026-08-12"
      readingTime="6 min read"
      relatedArticles={related}
    >
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">1. Character Grid & Units Per Em (UPM)</h2>
        <p>
          Digital type design begins on a coordinate grid defined by <strong>Units Per Em (UPM)</strong> — typically set to 1000 UPM for OpenType CFF fonts or 2048 UPM for TrueType fonts. Key horizontal metrics lines include:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Baseline (0 UPM):</strong> The reference origin for glyph placement.</li>
          <li><strong>Ascender (800 UPM):</strong> The top limit for lowercase stems (b, d, h).</li>
          <li><strong>Descender (-200 UPM):</strong> The bottom limit for hanging stems (g, p, y).</li>
          <li><strong>Cap Height (700 UPM):</strong> The height of uppercase capital letters (A, B, C).</li>
        </ul>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">2. Vector Outline Generation</h2>
        <p>
          Every glyph outline is constructed using closed vector paths composed of control points and Bezier curves. In automated generative font engines, neural network models output node coordinates directly into standard SVG path format before compilation.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">3. Binary sfnt Table Packaging</h2>
        <p>
          Once glyph vectors are synthesized, they are mapped to Unicode character codepoints (e.g. U+0041 for &apos;A&apos;) and compiled into sfnt binary tables including <code>head</code>, <code>hhea</code>, <code>maxp</code>, <code>cmap</code>, and <code>glyf/CFF</code> tables using OpenType compilation libraries like <code>fontkit</code>.
        </p>
      </div>
    </ArticleLayout>
  );
}
