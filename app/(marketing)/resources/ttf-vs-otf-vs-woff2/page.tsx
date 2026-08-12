import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/marketing/ArticleLayout';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'TTF vs OTF vs WOFF2: Font File Format Guide',
  description:
    'A technical comparison of TrueType, OpenType, and Web Open Font Format 2 binaries for desktop and web applications.',
  path: '/resources/ttf-vs-otf-vs-woff2',
});

export default function Article2Page() {
  const related = [
    {
      title: 'How to Create a Custom Font from Scratch',
      href: '/resources/how-to-create-a-custom-font',
      description: 'Comprehensive guide to custom typeface creation and sfnt tables.',
    },
    {
      title: 'How to Describe a Font to an AI Font Generator',
      href: '/resources/how-to-describe-a-font-to-an-ai-font-generator',
      description: 'Learn how to write effective prompts for AI vector font generators.',
    },
  ];

  return (
    <ArticleLayout
      title="TTF vs OTF vs WOFF2: Font File Format Guide"
      description="Understanding the structural differences, compression mechanics, and platform compatibility between TTF, OTF, and WOFF2 font binaries."
      slug="ttf-vs-otf-vs-woff2"
      publishedDate="2026-08-12"
      readingTime="5 min read"
      relatedArticles={related}
    >
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">1. TrueType Font (.TTF)</h2>
        <p>
          Developed jointly by Apple and Microsoft in the late 1980s, TrueType uses quadratic Bezier curves for outline geometry. TTF files remain the universal baseline standard for desktop operating systems (macOS and Windows) and desktop graphic applications.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">2. OpenType Font (.OTF)</h2>
        <p>
          Built upon the TrueType architecture by Adobe and Microsoft, OpenType incorporates PostScript Compact Font Format (CFF) cubic Bezier curves. OTF binaries support advanced typographic features including contextual alternates, ligatures, small caps, and extensive Unicode character mapping tables.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">3. Web Open Font Format 2 (.WOFF2)</h2>
        <p>
          WOFF2 is the modern web standard, applying Brotli byte-level compression to sfnt font tables. WOFF2 font files achieve up to 30% smaller payload sizes than standard TTF/OTF binaries, reducing page load times and network latency on web applications.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">Summary Comparison</h2>
        <div className="overflow-x-auto border border-[#27272a] rounded-md font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121215] border-b border-[#27272a] text-[#f4f4f5]">
                <th className="p-3">Format</th>
                <th className="p-3">Primary Use</th>
                <th className="p-3">Curve Math</th>
                <th className="p-3">Compression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] text-[#a1a1aa]">
              <tr>
                <td className="p-3 font-bold text-[#e05638]">TTF</td>
                <td className="p-3">Desktop OS & Graphics</td>
                <td className="p-3">Quadratic Bezier</td>
                <td className="p-3">Uncompressed</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#e05638]">OTF</td>
                <td className="p-3">Publishing & Advanced Type</td>
                <td className="p-3">Cubic Bezier (CFF)</td>
                <td className="p-3">Compact CFF</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#e05638]">WOFF2</td>
                <td className="p-3">Production Web Apps</td>
                <td className="p-3">Cubic / Quadratic</td>
                <td className="p-3">Brotli Compressed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ArticleLayout>
  );
}
