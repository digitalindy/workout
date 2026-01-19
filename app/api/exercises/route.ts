import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { z } from 'zod';
import { exerciseSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const allExercises = await db.select().from(exercises).orderBy(exercises.name);
    return NextResponse.json(allExercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = exerciseSchema.parse(body);

    const [newExercise] = await db
      .insert(exercises)
      .values({
        name: validatedData.name,
        instructions: validatedData.instructions,
        gifUrl: validatedData.gifUrl || null,
        usesWeight: validatedData.usesWeight ?? true,
      })
      .returning();

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    console.error('Error creating exercise:', error);
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 });
  }
}
