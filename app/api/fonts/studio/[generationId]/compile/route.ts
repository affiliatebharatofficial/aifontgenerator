import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { FontStudioService } from '@/lib/font/studio/studioService';

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
    const { overrides, customFontName, format = 'ttf' } = body;

    const { buffers, fontName, qualityScore } = await FontStudioService.compileEditedFont(
      generationId,
      overrides || {},
      customFontName
    );

    // If format is requested for direct download stream
    if (format === 'ttf' || format === 'otf' || format === 'woff2') {
      const buffer = buffers[format as keyof typeof buffers];
      const mimeType = format === 'woff2' ? 'font/woff2' : 'font/ttf';
      const cleanFileName = `${fontName.toLowerCase().replace(/\s+/g, '_')}.${format}`;

      return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${cleanFileName}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }

    // Return base64 preview buffer and quality stats
    return NextResponse.json({
      success: true,
      fontName,
      qualityScore,
      previewWoff2Base64: buffers.woff2.toString('base64'),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
