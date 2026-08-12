import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { getUserCollections } from '@/lib/library/service';
import Link from 'next/link';
import { ArrowLeft, FolderPlus, Folder, Plus } from 'lucide-react';
import { CollectionsListClient } from './CollectionsListClient';

export const metadata: Metadata = {
  title: 'Font Collections — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CollectionsPage() {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect('/login?redirect=/dashboard/library/collections');
  }

  const collections = await getUserCollections(user.id);

  return (
    <div className="w-full space-y-10 font-mono text-xs text-[#a1a1aa]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272a]">
        <div className="space-y-2">
          <Link
            href="/dashboard/library"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </Link>

          <h1 className="font-display font-normal text-4xl sm:text-5xl text-[#f4f4f5] tracking-tight uppercase">
            FONT COLLECTIONS
          </h1>
          <p className="text-xs text-[#71717a]">
            Organize your generated typefaces into custom project folders.
          </p>
        </div>
      </div>

      <CollectionsListClient initialCollections={collections} />
    </div>
  );
}
