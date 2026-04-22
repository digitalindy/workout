import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { z } from 'zod';
import { exerciseSchema } from '@/lib/validation/schemas';
import { extractExerciseMuscleGroups, extractExerciseEquipment } from '@/lib/exercises/metadata';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const muscleFilter = url.searchParams.get('muscleGroup')?.trim().toLowerCase();
    const equipFilter = url.searchParams.get('equipment')?.trim().toLowerCase();

    const all = await db.select().from(exercises).orderBy(exercises.name);

    if (!muscleFilter && !equipFilter) {
      return NextResponse.json(all);
    }

    const filtered = all.filter((ex) => {
      if (muscleFilter) {
        const mgs = extractExerciseMuscleGroups(ex.instructions);
        if (!mgs.some((m) => m.toLowerCase().includes(muscleFilter))) {
          return false;
        }
      }
      if (equipFilter) {
        const equip = extractExerciseEquipment(ex.instructions);
        if (!equip || !equip.toLowerCase().includes(equipFilter)) {
          return false;
        }
      }
      return true;
    });

    return NextResponse.json(filtered);
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
