import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/marketing/ArticleLayout';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'How Typography Changes Brand Personality',
  description:
    'Discover how stem contrast, x-height, and serif geometry evoke trust, innovation, luxury, or playfulness in brand marks.',
  path: '/resources/how-typography-changes-brand-personality',
});

export default function Article4Page() {
  const related = [
    {
      title: 'What Makes a Good Display Font',
      href: '/resources/what-makes-a-good-display-font',
      description: 'Key principles for creating eye-catching headline typefaces.',
    },
    {
      title: 'How to Describe a Font to an AI Font Generator',
      href: '/resources/how-to-describe-a-font-to-an-ai-font-generator',
      description: 'Learn how to write effective prompts for AI font engines.',
    },
  ];

  return (
    <ArticleLayout
      title="How Typography Changes Brand Personality"
      description="Typography acts as the subconscious voice of visual design. Analyzing how stroke weight, serif geometry, and character width influence user perception."
      slug="how-typography-changes-brand-personality"
      publishedDate="2026-08-12"
      readingTime="4 min read"
      relatedArticles={related}
    >
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">1. Geometric Sans Serifs — Innovation & Technology</h2>
        <p>
          Typefaces based on clean geometric shapes (circles, squares, and equilateral triangles) convey modernism, engineering precision, and technical clarity. Technology companies favor low-contrast geometric sans serifs for clean UI rendering.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">2. High-Contrast Didone Serifs — Luxury & Fashion</h2>
        <p>
          Extreme stroke contrast — pairing thick main stems with paper-thin hairline serifs — signals heritage, refinement, and high fashion. Editorial magazines and luxury fashion houses rely on Didone serifs for prestige headlines.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">3. Humanist Serifs — Trust & Authority</h2>
        <p>
          Calligraphic humanist serifs with organic stroke angles mimic traditional pen strokes, instilling a sense of authority, academic trustworthiness, and financial stability.
        </p>
      </div>
    </ArticleLayout>
  );
}
