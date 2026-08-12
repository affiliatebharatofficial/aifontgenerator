import type { Metadata } from 'next';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { redirect, notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getImportedFontDetails } from '@/lib/font/importer/service';
import { ImportedFontDetailView } from '@/components/font/importer/ImportedFontDetailView';

export const metadata: Metadata = {
  title: 'Imported Font Specimen — AI Font Generator',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ImportedFontDetailPage({
  params,
}: {
  params: Promise<{ fontId: string }>;
}) {
  const { fontId } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) {
    redirect(`/login?redirect=/import-font/${fontId}`);
  }

  const { font, license } = await getImportedFontDetails(fontId, user.id);

  if (!font) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <ImportedFontDetailView font={font} license={license} />
      </main>

      <Footer />
    </div>
  );
}
