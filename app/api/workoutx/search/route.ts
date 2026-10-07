import { NextRequest, NextResponse } from 'next/server';
import { searchExercises, WorkoutXError } from '@/lib/workoutx/client';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim();
  if (!name) {
    return NextResponse.json({ error: 'name query parameter is required' }, { status: 400 });
  }
  const offset = Math.max(0, parseInt(request.nextUrl.searchParams.get('offset') ?? '0') || 0);

  try {
    return NextResponse.json(await searchExercises(name, offset));
  } catch (error) {
    if (error instanceof WorkoutXError && error.status === 429) {
      return NextResponse.json({ error: 'WorkoutX quota or rate limit exceeded' }, { status: 429 });
    }
    console.error('Error searching WorkoutX:', error);
    return NextResponse.json({ error: 'Failed to search WorkoutX' }, { status: 502 });
  }
}
