import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/marketing/ArticleLayout';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'What Makes a Good Display Font',
  description:
    'Key design principles for creating eye-catching headline typefaces optimized for posters, logos, and digital titles.',
  path: '/resources/what-makes-a-good-display-font',
});

export default function Article5Page() {
  const related = [
    {
      title: 'How Typography Changes Brand Personality',
      href: '/resources/how-typography-changes-brand-personality',
      description: 'Discover how stem contrast and serif geometry evoke brand trust.',
    },
    {
      title: 'How to Describe a Font to an AI Font Generator',
      href: '/resources/how-to-describe-a-font-to-an-ai-font-generator',
      description: 'Learn how to write effective prompts for AI font generators.',
    },
  ];

  return (
    <ArticleLayout
      title="What Makes a Good Display Font"
      description="Display typography breaks traditional body text legibility constraints to deliver expressive, high-impact headlines, packaging marks, and poster titles."
      slug="what-makes-a-good-display-font"
      publishedDate="2026-08-12"
      readingTime="5 min read"
      relatedArticles={related}
    >
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">1. Distinct Character Silhouettes</h2>
        <p>
          Unlike body fonts engineered for unobtrusive continuous reading at 10pt size, display fonts prioritize unmistakable character silhouettes. Unique terminal cuts, tight counter spaces, and expressive ascender angles ensure instant visual recognition in large titles.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">2. Tight Side Bearings & Spacing</h2>
        <p>
          Display fonts are designed to be set at large point sizes. Their glyph side bearings (default left/right margin spacing) are set noticeably tighter than body fonts to prevent awkward gaps between letters when rendered at 72pt or higher.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">3. High Contrast & Decorative Detailing</h2>
        <p>
          Because display type is rendered large, fine vector details — such as ultra-thin hairline serifs, stencil breaks, or sharp chamfered joints — stay crisp and legible without blurring into solid background fills.
        </p>
      </div>
    </ArticleLayout>
  );
}
