import { saveToReader } from '@/lib/readwise';
import type { SaveRequest } from '@/types/feed';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  let body: SaveRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.url || !body.title) {
    return Response.json({ success: false, error: 'url and title are required' }, { status: 400 });
  }

  const result = await saveToReader({
    url: body.url,
    title: body.title,
    tags: body.tags,
  });

  return Response.json(result, { status: result.success ? 200 : 500 });
}
