import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { getUserLibraryFonts, getUserCollections } from '@/lib/library/service';
import { FontLibraryWorkspace } from '@/components/library/FontLibraryWorkspace';

export const metadata: Metadata = {
  title: 'Type Library — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FontLibraryPage() {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/dashboard/library');
  }

  // Fetch real library data for authenticated user
  const { generations, filesMap, favoriteIds, tagsMap, allTags, importedFonts } =
    await getUserLibraryFonts(user.id);

  const collections = await getUserCollections(user.id);

  return (
    <div className="w-full space-y-8">
      <FontLibraryWorkspace
        initialGenerations={generations}
        filesMap={filesMap}
        favoriteIds={favoriteIds}
        tagsMap={tagsMap}
        allTags={allTags}
        collections={collections}
        importedFonts={importedFonts}
      />
    </div>
  );
}
