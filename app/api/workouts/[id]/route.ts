import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutLogs, workoutSets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { workoutLogUpdateSchema } from '@/lib/validation/schemas';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const log = await db.query.workoutLogs.findFirst({
      where: eq(workoutLogs.id, parseInt(id)),
      with: {
        workoutPlan: true,
        sets: {
          with: {
            exercise: true,
          },
          orderBy: (sets, { asc }) => [asc(sets.setNumber)],
        },
      },
    });

    if (!log) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error fetching workout log:', error);
    return NextResponse.json({ error: 'Failed to fetch workout log' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = workoutLogUpdateSchema.parse(body);

    const [updatedLog] = await db
      .update(workoutLogs)
      .set({
        workoutPlanId: validatedData.workoutPlanId,
        notes: validatedData.notes,
        performedAt: validatedData.performedAt ? new Date(validatedData.performedAt) : undefined,
      })
      .where(eq(workoutLogs.id, parseInt(id)))
      .returning();

    if (!updatedLog) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    if (validatedData.sets) {
      await db.delete(workoutSets).where(eq(workoutSets.workoutLogId, parseInt(id)));

      if (validatedData.sets.length > 0) {
        await db.insert(workoutSets).values(
          validatedData.sets.map((set) => ({
            workoutLogId: parseInt(id),
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            weight: set.weight?.toString(),
            reps: set.reps,
            notes: set.notes,
            completed: set.completed ?? false,
          }))
        );
      }
    }

    const logWithSets = await db.query.workoutLogs.findFirst({
      where: eq(workoutLogs.id, parseInt(id)),
      with: {
        workoutPlan: true,
        sets: {
          with: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(logWithSets);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    console.error('Error updating workout log:', error);
    return NextResponse.json({ error: 'Failed to update workout log' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(workoutLogs).where(eq(workoutLogs.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout log:', error);
    return NextResponse.json({ error: 'Failed to delete workout log' }, { status: 500 });
  }
}
