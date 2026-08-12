import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/marketing/ArticleLayout';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'How to Describe a Font to an AI Font Generator',
  description:
    'Learn how to write effective prompts using stroke weight, corner geometry, mood descriptors, and historical style classifications.',
  path: '/resources/how-to-describe-a-font-to-an-ai-font-generator',
});

export default function Article1Page() {
  const related = [
    {
      title: 'TTF vs OTF vs WOFF2: Font File Format Guide',
      href: '/resources/ttf-vs-otf-vs-woff2',
      description: 'Technical comparison of desktop and web font binaries.',
    },
    {
      title: 'What Makes a Good Display Font',
      href: '/resources/what-makes-a-good-display-font',
      description: 'Key principles for creating eye-catching headline typefaces.',
    },
  ];

  return (
    <ArticleLayout
      title="How to Describe a Font to an AI Font Generator"
      description="Writing precise text prompts for generative vector font tools requires combining structural typography terms with visual aesthetic keywords."
      slug="how-to-describe-a-font-to-an-ai-font-generator"
      publishedDate="2026-08-12"
      readingTime="4 min read"
      relatedArticles={related}
    >
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">1. Structural Parameters vs Mood Descriptors</h2>
        <p>
          Generative typography neural models evaluate prompts by splitting words into two primary categories: <strong>structural parameters</strong> (physical glyph geometry) and <strong>mood descriptors</strong> (aesthetic style).
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Structural Keywords:</strong> High stroke contrast, hairline serifs, chamfered 45-degree terminals, wide extended width, heavy black stem weight.</li>
          <li><strong>Mood Keywords:</strong> Architectural, luxury fashion, cyberpunk neon, editorial brutalist, organic handwriting.</li>
        </ul>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">2. Anatomy of an Effective Prompt</h2>
        <p>
          To achieve optimal vector outline generation, structure your text input following this formula:
        </p>
        <div className="p-4 bg-[#121215] border border-[#27272a] font-mono text-xs text-[#e05638] rounded-md">
          [Weight/Width] + [Category/Style] + [Stroke/Corner Details] + [Target Use Case Mood]
        </div>
        <p>
          For example: <em>&quot;Heavy black geometric sans serif with sharp triangular terminals and high stroke contrast designed for architectural branding.&quot;</em>
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">3. Words to Avoid in Font Prompts</h2>
        <p>
          Avoid vague buzzwords like &quot;cool font&quot;, &quot;nice typography&quot;, or &quot;amazing text style&quot;. Vague adjectives reduce prompt specificity and result in generic fallback glyphs. Always rely on precise design terminology.
        </p>
      </div>
    </ArticleLayout>
  );
}
