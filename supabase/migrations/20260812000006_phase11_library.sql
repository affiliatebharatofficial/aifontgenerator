-- AI Font Generator Phase 11 Schema Migration
-- Tables: font_favorites, font_collections, font_collection_items, font_tags

-- 1. Create font_favorites table
CREATE TABLE IF NOT EXISTS public.font_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES public.font_generations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_generation_favorite UNIQUE (user_id, generation_id)
);

-- 2. Create font_collections table
CREATE TABLE IF NOT EXISTS public.font_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create font_collection_items table
CREATE TABLE IF NOT EXISTS public.font_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.font_collections(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES public.font_generations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_collection_generation_item UNIQUE (collection_id, generation_id)
);

-- 4. Create font_tags table
CREATE TABLE IF NOT EXISTS public.font_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES public.font_generations(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_generation_tag UNIQUE (generation_id, tag)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_font_favorites_user ON public.font_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_font_favorites_generation ON public.font_favorites(generation_id);
CREATE INDEX IF NOT EXISTS idx_font_collections_user ON public.font_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_font_collection_items_collection ON public.font_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_font_collection_items_generation ON public.font_collection_items(generation_id);
CREATE INDEX IF NOT EXISTS idx_font_tags_user ON public.font_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_font_tags_generation ON public.font_tags(generation_id);
CREATE INDEX IF NOT EXISTS idx_font_tags_tag ON public.font_tags(tag);

-- Enable RLS
ALTER TABLE public.font_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.font_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.font_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.font_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for font_favorites
CREATE POLICY "Users manage own favorites" ON public.font_favorites
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- RLS Policies for font_collections
CREATE POLICY "Users manage own collections" ON public.font_collections
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- RLS Policies for font_collection_items
CREATE POLICY "Users manage own collection items" ON public.font_collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.font_collections c
      WHERE c.id = font_collection_items.collection_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.font_collections c
      WHERE c.id = font_collection_items.collection_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

-- RLS Policies for font_tags
CREATE POLICY "Users manage own font tags" ON public.font_tags
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Triggers for updated_at
CREATE TRIGGER tr_font_collections_updated_at
  BEFORE UPDATE ON public.font_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
