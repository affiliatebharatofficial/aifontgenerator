import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { AIGlyphEditor } from '@/lib/font/studio/aiGlyphEditor';
import { createClient } from '@/lib/supabase/server';
import type { StyleDNA } from '@/lib/font/specification/dna';
import type { GenerationControls } from '@/lib/font/specification/generationControls';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> }
) {
  try {
    const { generationId } = await params;
    const { user } = await getCurrentUserProfile();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { instruction, char, unicode, currentTransforms } = body;

    if (!instruction || !char) {
      return NextResponse.json({ error: 'Missing instruction or char' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: job } = await supabase
      .from('font_generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single();

    const rawJob = job as Record<string, unknown> | null;
    const styleDNA = (rawJob?.style_dna as unknown as StyleDNA) || null;
    const generationControls = (rawJob?.generation_controls as unknown as GenerationControls) || null;

    const result = await AIGlyphEditor.interpretGlyphEdit({
      instruction,
      char,
      unicode: unicode || char.charCodeAt(0),
      styleDNA,
      generationControls,
      currentTransforms,
    });

    return NextResponse.json({
      success: true,
      instruction: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
