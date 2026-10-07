import { NextResponse } from 'next/server';
import { fetchGif, WorkoutXError } from '@/lib/workoutx/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^[a-z0-9]+$/i.test(id)) {
    return NextResponse.json({ error: 'GIF not found' }, { status: 404 });
  }

  try {
    const gif = await fetchGif(id);

    // A GIF never changes for a given ID, so let the browser and CDN hold onto it
    // and spare the WorkoutX quota.
    return new Response(gif.body, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=604800, s-maxage=31536000, immutable',
      },
    });
  } catch (error) {
    if (error instanceof WorkoutXError && error.status === 404) {
      return NextResponse.json({ error: 'GIF not found' }, { status: 404 });
    }
    console.error('Error fetching WorkoutX GIF:', error);
    return NextResponse.json({ error: 'Failed to fetch GIF' }, { status: 502 });
  }
}
