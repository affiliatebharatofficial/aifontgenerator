import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { getUserDailyUsage } from '@/lib/generations/service';
import { redirect } from 'next/navigation';
import { GeneratorForm } from './GeneratorForm';

export const metadata: Metadata = {
  title: 'AI Font Generator — Create Custom Fonts with AI',
  description:
    'Create custom fonts with AI. Describe your style, configure your typeface, and generate a downloadable font.',
  robots: {
    index: false,
    follow: false,
  },
};

import { createClient } from '@/lib/supabase/server';
import type { FontCategory, FontGeneration } from '@/types/database';

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; parentGenerationId?: string }>;
}) {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/generate');
  }

  const resolvedParams = await searchParams;
  const rawCat = resolvedParams.category || '';
  const parentGenId = resolvedParams.parentGenerationId || '';

  let parentGen: FontGeneration | undefined = undefined;
  if (parentGenId) {
    const supabase = await createClient();
    const { data: parentData } = await supabase
      .from('font_generations')
      .select('*')
      .eq('id', parentGenId)
      .eq('user_id', user.id)
      .single();

    if (parentData) {
      parentGen = parentData as unknown as FontGeneration;
    }
  }

  const validCategories: FontCategory[] = [
    'Sans Serif',
    'Serif',
    'Display',
    'Handwritten',
    'Script',
    'Monospace',
    'Decorative',
    'Pixel',
    'Blackletter',
    'Other',
  ];

  const matchedCat = validCategories.find(
    (c) => c.toLowerCase() === rawCat.toLowerCase().replace(/-/g, ' ')
  );

  const usageInfo = await getUserDailyUsage(user.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            TYPE DESIGN STUDIO
          </span>
          <h1 className="font-display font-normal text-4xl sm:text-6xl text-[#f4f4f5] tracking-tight uppercase">
            SYNTHESIZE TYPEFACE
          </h1>
          <p className="text-xs font-mono text-[#a1a1aa]">
            Describe a visual direction, configure glyph parameters, and compile custom font binaries.
          </p>
        </div>

        <GeneratorForm
          usageCount={usageInfo.count}
          usageLimit={usageInfo.limit}
          initialCategory={matchedCat}
          parentGen={parentGen}
        />
      </main>

      <Footer />
    </div>
  );
}
