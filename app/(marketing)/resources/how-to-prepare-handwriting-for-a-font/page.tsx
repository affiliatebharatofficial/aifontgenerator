import type { Metadata } from 'next';
import { ArticleLayout } from '@/components/marketing/ArticleLayout';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'How to Prepare Handwriting Characteristics for a Font',
  description:
    'Guidelines for analyzing pen strokes, slant, baseline rhythm, and converting handwritten characteristics into vector prompts.',
  path: '/resources/how-to-prepare-handwriting-for-a-font',
});

export default function Article6Page() {
  const related = [
    {
      title: 'How to Describe a Font to an AI Font Generator',
      href: '/resources/how-to-describe-a-font-to-an-ai-font-generator',
      description: 'Learn how to write effective prompts using typography parameters.',
    },
    {
      title: 'How to Create a Custom Font from Scratch',
      href: '/resources/how-to-create-a-custom-font',
      description: 'Comprehensive guide to custom typeface creation and sfnt tables.',
    },
  ];

  return (
    <ArticleLayout
      title="How to Prepare Handwriting Characteristics for a Font"
      description="Deconstructing handwritten stroke dynamics into structured text prompt descriptions for generative vector script font synthesis."
      slug="how-to-prepare-handwriting-for-a-font"
      publishedDate="2026-08-12"
      readingTime="4 min read"
      relatedArticles={related}
    >
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">1. Identifying Pen Instrument Dynamics</h2>
        <p>
          Before describing a handwriting style to a generative AI font model, analyze the physical pen instrument used to create the original handwriting sample.
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Ballpoint Pen:</strong> Uniform thin line weight, slight stroke friction texture, rounded terminals.</li>
          <li><strong>Felt-Tip Marker:</strong> Medium heavy stem weight, soft absorbent ink bleed, smooth counters.</li>
          <li><strong>Broad-Nib Calligraphy Pen:</strong> Extreme thick-to-thin stroke contrast based on 45-degree nib angle.</li>
        </ul>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">2. Baseline Rhythm & Slant Angle</h2>
        <p>
          Handwriting derives its human character from natural slant angles and slight baseline variation. Upright printing feels technical or architectural, whereas a 15-degree forward italic slant imparts speed and personal letter correspondence feeling.
        </p>

        <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">3. Translating Characteristics into Vector Prompts</h2>
        <p>
          Combine instrument type, stroke contrast, slant, and baseline rhythm into a clear prompt description to synthesize your target handwriting script.
        </p>
      </div>
    </ArticleLayout>
  );
}
