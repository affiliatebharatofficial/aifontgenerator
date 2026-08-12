import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fontId: string }> }
) {
  const { fontId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: font } = await supabase
    .from('imported_fonts')
    .select('storage_path, original_filename, format')
    .eq('id', fontId)
    .eq('user_id', user.id)
    .single();

  if (!font || !font.storage_path) {
    return NextResponse.json({ error: 'Font not found' }, { status: 404 });
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from('fonts')
    .download(font.storage_path);

  if (downloadError || !fileBlob) {
    return NextResponse.json({ error: 'Failed to retrieve font file' }, { status: 500 });
  }

  const arrayBuffer = await fileBlob.arrayBuffer();

  const safeFilename = (font.original_filename || `font.${font.format}`)
    .replace(/[^a-zA-Z0-9_.-]/g, '_');

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}
