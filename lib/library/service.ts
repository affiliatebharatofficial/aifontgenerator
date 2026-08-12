import { createClient } from '@/lib/supabase/server';
import type {
  FontCollection,
  FontGeneration,
  GeneratedFile,
  ImportedFont,
} from '@/types/database';
import { getUserImportedFonts } from '@/lib/font/importer/service';

export interface CollectionWithCount extends FontCollection {
  item_count: number;
}

export interface LibraryFetchOptions {
  search?: string;
  category?: string;
  style?: string;
  weight?: string;
  width?: string;
  favoritesOnly?: boolean;
  collectionId?: string;
  tag?: string;
  source?: 'all' | 'generated' | 'imported';
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
}

/**
 * Service: Fetch user's completed library fonts with filters, tags, and favorites status
 */
export async function getUserLibraryFonts(
  userId: string,
  options?: LibraryFetchOptions
): Promise<{
  generations: FontGeneration[];
  filesMap: Record<string, GeneratedFile[]>;
  favoriteIds: string[];
  tagsMap: Record<string, string[]>;
  allTags: string[];
  importedFonts: ImportedFont[];
}> {
  const supabase = await createClient();

  const importedFonts = await getUserImportedFonts(userId);

  // 1. Fetch user's favorited generation IDs
  const { data: favoritesData } = await supabase
    .from('font_favorites')
    .select('generation_id')
    .eq('user_id', userId);
  const favoriteIds = (favoritesData || []).map((f: { generation_id: string }) => f.generation_id);

  // 2. Fetch user's tags
  const { data: tagsData } = await supabase
    .from('font_tags')
    .select('generation_id, tag')
    .eq('user_id', userId);

  const tagsMap: Record<string, string[]> = {};
  const allTagsSet = new Set<string>();

  (tagsData || []).forEach((t: { generation_id: string; tag: string }) => {
    if (!tagsMap[t.generation_id]) tagsMap[t.generation_id] = [];
    tagsMap[t.generation_id].push(t.tag);
    allTagsSet.add(t.tag);
  });

  // 3. Fetch collection items if filtering by collection
  let collectionGenIds: string[] | null = null;
  if (options?.collectionId && options.collectionId !== 'all') {
    const { data: collectionItems } = await supabase
      .from('font_collection_items')
      .select('generation_id')
      .eq('collection_id', options.collectionId);
    collectionGenIds = (collectionItems || []).map((i: { generation_id: string }) => i.generation_id);
  }

  // 4. Build font_generations query (completed status ONLY for library workspace)
  let query = supabase
    .from('font_generations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Favorites filter
  if (options?.favoritesOnly && favoriteIds.length > 0) {
    query = query.in('id', favoriteIds);
  } else if (options?.favoritesOnly && favoriteIds.length === 0) {
    return {
      generations: [],
      filesMap: {},
      favoriteIds: [],
      tagsMap,
      allTags: Array.from(allTagsSet),
      importedFonts,
    };
  }

  // Collection filter
  if (collectionGenIds !== null) {
    if (collectionGenIds.length === 0) {
      return {
        generations: [],
        filesMap: {},
        favoriteIds,
        tagsMap,
        allTags: Array.from(allTagsSet),
        importedFonts,
      };
    }
    query = query.in('id', collectionGenIds);
  }

  // Category filter
  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category);
  }

  // Style filter
  if (options?.style && options.style !== 'all') {
    query = query.eq('style', options.style);
  }

  // Weight filter
  if (options?.weight && options.weight !== 'all') {
    query = query.eq('weight', options.weight);
  }

  // Width filter
  if (options?.width && options.width !== 'all') {
    query = query.eq('width', options.width);
  }

  // Search query filter
  if (options?.search && options.search.trim().length > 0) {
    const safeSearch = options.search.trim().replace(/[,()]/g, '');
    if (safeSearch.length > 0) {
      const s = `%${safeSearch}%`;
      query = query.or(`font_name.ilike.${s},prompt.ilike.${s},category.ilike.${s},style.ilike.${s}`);
    }
  }

  // Sort Order
  if (options?.sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (options?.sortBy === 'name_asc') {
    query = query.order('font_name', { ascending: true });
  } else if (options?.sortBy === 'name_desc') {
    query = query.order('font_name', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: rawGenerations } = await query;
  let generations = (rawGenerations as unknown as FontGeneration[]) ?? [];

  // Tag filter in memory if specified
  if (options?.tag && options.tag !== 'all') {
    const targetTag = options.tag.toLowerCase();
    generations = generations.filter((g) => {
      const gTags = tagsMap[g.id] || [];
      return gTags.some((t) => t.toLowerCase() === targetTag);
    });
  }

  // Fetch compiled generated_files map
  const completedIds = generations.map((g) => g.id);
  let filesMap: Record<string, GeneratedFile[]> = {};

  if (completedIds.length > 0) {
    const { data: filesData } = await supabase
      .from('generated_files')
      .select('*')
      .in('generation_id', completedIds);

    const files = (filesData as GeneratedFile[] | null) ?? [];
    filesMap = files.reduce((acc, f) => {
      if (!acc[f.generation_id]) acc[f.generation_id] = [];
      acc[f.generation_id].push(f);
      return acc;
    }, {} as Record<string, GeneratedFile[]>);
  }

  return {
    generations,
    filesMap,
    favoriteIds,
    tagsMap,
    allTags: Array.from(allTagsSet),
    importedFonts,
  };
}

/**
 * Service: Fetch user collections with item counts
 */
export async function getUserCollections(userId: string): Promise<CollectionWithCount[]> {
  const supabase = await createClient();

  const { data: collections } = await supabase
    .from('font_collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!collections || collections.length === 0) return [];

  const collectionIds = collections.map((c: { id: string }) => c.id);

  const { data: items } = await supabase
    .from('font_collection_items')
    .select('collection_id')
    .in('collection_id', collectionIds);

  const countMap: Record<string, number> = {};
  (items || []).forEach((item: { collection_id: string }) => {
    countMap[item.collection_id] = (countMap[item.collection_id] || 0) + 1;
  });

  return (collections as FontCollection[]).map((c) => ({
    ...c,
    item_count: countMap[c.id] || 0,
  }));
}
