'use server';

import { getCurrentUserProfile } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Action: Toggle Favorite for a completed font generation owned by user
 */
export async function toggleFavoriteAction(
  generationId: string
): Promise<{ success: boolean; isFavorited?: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return { success: false, error: 'Authentication required.' };
  }

  const supabase = await createClient();

  // Verify ownership and completion status
  const { data: gen } = await supabase
    .from('font_generations')
    .select('id, user_id, status')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single();

  if (!gen || gen.status !== 'completed') {
    return { success: false, error: 'Font generation not found or not completed.' };
  }

  // Check existing favorite
  const { data: existing } = await supabase
    .from('font_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('generation_id', generationId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    await supabase
      .from('font_favorites')
      .delete()
      .eq('id', existing.id);

    revalidatePath('/dashboard/library');
    return { success: true, isFavorited: false };
  } else {
    // Add favorite
    await supabase.from('font_favorites').insert({
      user_id: user.id,
      generation_id: generationId,
    });

    revalidatePath('/dashboard/library');
    return { success: true, isFavorited: true };
  }
}

/**
 * Action: Create a new font collection
 */
export async function createCollectionAction(
  name: string,
  description?: string
): Promise<{ success: boolean; collectionId?: string; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) {
    return { success: false, error: 'Authentication required.' };
  }

  if (!name.trim()) {
    return { success: false, error: 'Collection name is required.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('font_collections')
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Failed to create collection.' };
  }

  revalidatePath('/dashboard/library/collections');
  return { success: true, collectionId: data.id };
}

/**
 * Action: Update collection name / description
 */
export async function updateCollectionAction(
  collectionId: string,
  name: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) return { success: false, error: 'Authentication required.' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('font_collections')
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', collectionId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/library/collections');
  revalidatePath(`/dashboard/library/collections/${collectionId}`);
  return { success: true };
}

/**
 * Action: Delete a collection
 */
export async function deleteCollectionAction(
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) return { success: false, error: 'Authentication required.' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('font_collections')
    .delete()
    .eq('id', collectionId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/library/collections');
  return { success: true };
}

/**
 * Action: Add font to collection
 */
export async function addFontToCollectionAction(
  collectionId: string,
  generationId: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) return { success: false, error: 'Authentication required.' };

  const supabase = await createClient();

  // Verify collection ownership
  const { data: collection } = await supabase
    .from('font_collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .single();

  if (!collection) return { success: false, error: 'Collection not found.' };

  // Verify generation ownership
  const { data: gen } = await supabase
    .from('font_generations')
    .select('id')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single();

  if (!gen) return { success: false, error: 'Font not found.' };

  const { error } = await supabase
    .from('font_collection_items')
    .upsert(
      { collection_id: collectionId, generation_id: generationId },
      { onConflict: 'collection_id, generation_id' }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/library');
  revalidatePath(`/dashboard/library/collections/${collectionId}`);
  return { success: true };
}

/**
 * Action: Remove font from collection
 */
export async function removeFontFromCollectionAction(
  collectionId: string,
  generationId: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) return { success: false, error: 'Authentication required.' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('font_collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('generation_id', generationId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/library');
  revalidatePath(`/dashboard/library/collections/${collectionId}`);
  return { success: true };
}

/**
 * Action: Add tag to font
 */
export async function addTagToFontAction(
  generationId: string,
  tag: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) return { success: false, error: 'Authentication required.' };

  const cleanTag = tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanTag) return { success: false, error: 'Invalid tag format.' };

  const supabase = await createClient();

  // Verify generation ownership
  const { data: gen } = await supabase
    .from('font_generations')
    .select('id')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single();

  if (!gen) return { success: false, error: 'Font not found.' };

  const { error } = await supabase
    .from('font_tags')
    .upsert(
      { user_id: user.id, generation_id: generationId, tag: cleanTag },
      { onConflict: 'generation_id, tag' }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/library');
  return { success: true };
}

/**
 * Action: Remove tag from font
 */
export async function removeTagFromFontAction(
  generationId: string,
  tag: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) return { success: false, error: 'Authentication required.' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('font_tags')
    .delete()
    .eq('user_id', user.id)
    .eq('generation_id', generationId)
    .eq('tag', tag.toLowerCase());

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/library');
  return { success: true };
}

/**
 * Action: Delete font from library
 */
export async function deleteFontFromLibraryAction(
  generationId: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getCurrentUserProfile();

  if (!user) return { success: false, error: 'Authentication required.' };

  const supabase = await createClient();

  const { error } = await supabase
    .from('font_generations')
    .delete()
    .eq('id', generationId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/library');
  return { success: true };
}
