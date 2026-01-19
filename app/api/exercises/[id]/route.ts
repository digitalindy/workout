import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exercises } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const exerciseSchema = z.object({
  name: z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  gifUrl: z.string().url().optional().or(z.literal('')),
  usesWeight: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, parseInt(id)));

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = exerciseSchema.parse(body);

    const [updatedExercise] = await db
      .update(exercises)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(exercises.id, parseInt(id)))
      .returning();

    if (!updatedExercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json(updatedExercise);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    console.error('Error updating exercise:', error);
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(exercises).where(eq(exercises.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 });
  }
}
