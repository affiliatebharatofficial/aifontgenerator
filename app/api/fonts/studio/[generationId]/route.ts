import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { FontStudioService } from '@/lib/font/studio/studioService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> }
) {
  try {
    const { generationId } = await params;
    const { user } = await getCurrentUserProfile();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await FontStudioService.getStudioGenerationData(generationId, user.id);
    const devanagariDebug = FontStudioService.getDevanagariShapingDebugData();

    return NextResponse.json({
      success: true,
      ...data,
      devanagariDebug,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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
    const { overrides, versionLabel, fontName } = body;

    const result = await FontStudioService.saveStudioVersion(
      generationId,
      user.id,
      overrides || {},
      versionLabel,
      fontName
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
