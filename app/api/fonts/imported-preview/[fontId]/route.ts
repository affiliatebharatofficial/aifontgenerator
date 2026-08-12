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

  // Fetch imported font record
  const { data: font } = await supabase
    .from('imported_fonts')
    .select('storage_path, format')
    .eq('id', fontId)
    .eq('user_id', user.id)
    .single();

  if (!font || !font.storage_path) {
    return NextResponse.json({ error: 'Font not found' }, { status: 404 });
  }

  // Download from Supabase private storage
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from('fonts')
    .download(font.storage_path);

  if (downloadError || !fileBlob) {
    return NextResponse.json({ error: 'Failed to retrieve font binary' }, { status: 500 });
  }

  const arrayBuffer = await fileBlob.arrayBuffer();

  const mimeType =
    font.format === 'woff2'
      ? 'font/woff2'
      : font.format === 'woff'
      ? 'font/woff'
      : font.format === 'otf'
      ? 'font/otf'
      : 'font/ttf';

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'private, max-age=86400',
    },
  });
}
