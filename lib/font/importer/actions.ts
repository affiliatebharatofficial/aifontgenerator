'use server';

import { getCurrentUserProfile } from '@/lib/auth/admin';
import { saveImportedFont, updateFontLicense, deleteImportedFont } from './service';
import { revalidatePath } from 'next/cache';

import { isFeatureEnabled } from '@/lib/admin/settings-service';

export async function importFontFileAction(
  formData: FormData
): Promise<{ success: boolean; fontId?: string; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return { success: false, error: 'Authentication required to import a font.' };
  }

  const enabled = await isFeatureEnabled('font_import', true);
  if (!enabled) {
    return { success: false, error: 'Font Importer feature is currently disabled by administrator.' };
  }

  const file = formData.get('fontFile') as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: 'Please select a valid font file to upload.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await saveImportedFont(user.id, file.name, buffer);

  if (result.success) {
    revalidatePath('/dashboard/library');
  }

  return result;
}

export async function updateFontLicenseAction(
  fontId: string,
  licenseName: string,
  licenseUrl: string,
  licenseNotes: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return { success: false, error: 'Authentication required.' };
  }

  const result = await updateFontLicense(
    fontId,
    user.id,
    licenseName,
    licenseUrl,
    licenseNotes
  );

  if (result.success) {
    revalidatePath(`/import-font/${fontId}`);
  }

  return result;
}

export async function deleteImportedFontAction(
  fontId: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return { success: false, error: 'Authentication required.' };
  }

  const result = await deleteImportedFont(fontId, user.id);

  if (result.success) {
    revalidatePath('/dashboard/library');
  }

  return result;
}
