import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> }
) {
  const { generationId } = await params;
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Verify generation ownership and status
  const { data: generation } = await supabase
    .from('font_generations')
    .select('id, user_id, status')
    .eq('id', generationId)
    .eq('user_id', user.id)
    .single();

  if (!generation || generation.status !== 'completed') {
    return new NextResponse('Font generation not found or not completed', { status: 404 });
  }

  // 3. Check requested format query parameter (default: prefer woff2)
  const formatParam = request.nextUrl.searchParams.get('format')?.toLowerCase();
  
  let query = supabase
    .from('generated_files')
    .select('storage_path, format')
    .eq('generation_id', generationId);

  if (formatParam && ['ttf', 'woff2', 'otf'].includes(formatParam)) {
    query = query.eq('format', formatParam);
  } else {
    query = query.in('format', ['woff2', 'ttf']).order('format', { ascending: false });
  }

  const { data: fileRecord } = await query.limit(1).maybeSingle();

  if (!fileRecord) {
    return new NextResponse('Generated font file not found', { status: 404 });
  }

  // 4. Stream private storage file
  const { data: fileBuffer, error: downloadError } = await supabase.storage
    .from('fonts')
    .download(fileRecord.storage_path);

  if (downloadError || !fileBuffer) {
    return new NextResponse('Failed to retrieve font file from storage', { status: 500 });
  }

  const mimeTypeMap: Record<string, string> = {
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
  };
  const mimeType = mimeTypeMap[fileRecord.format] || 'application/octet-stream';
  const arrayBuffer = await fileBuffer.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
