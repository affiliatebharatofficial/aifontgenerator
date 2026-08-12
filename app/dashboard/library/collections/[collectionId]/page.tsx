import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect, notFound } from 'next/navigation';
import { getUserLibraryFonts, getUserCollections } from '@/lib/library/service';
import { createClient } from '@/lib/supabase/server';
import type { FontCollection } from '@/types/database';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CollectionDetailClient } from './CollectionDetailClient';

export const metadata: Metadata = {
  title: 'Collection Details — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/dashboard/library/collections/${collectionId}`);
  }

  const supabase = await createClient();

  // Fetch collection
  const { data: collectionData } = await supabase
    .from('font_collections')
    .select('*')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single();

  const collection = collectionData as unknown as FontCollection | null;
  if (!collection) {
    notFound();
  }

  // Fetch member fonts
  const { generations, filesMap, favoriteIds, tagsMap } = await getUserLibraryFonts(
    user.id,
    { collectionId }
  );

  return (
    <div className="w-full space-y-10 font-mono text-xs text-[#a1a1aa]">
      <div className="space-y-2">
        <Link
          href="/dashboard/library/collections"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collections</span>
        </Link>
      </div>

      <CollectionDetailClient
        collection={collection}
        generations={generations}
        filesMap={filesMap}
        favoriteIds={favoriteIds}
        tagsMap={tagsMap}
      />
    </div>
  );
}
