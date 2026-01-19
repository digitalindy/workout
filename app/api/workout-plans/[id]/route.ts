import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutPlans, workoutPlanExercises } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const workoutPlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  exercises: z.array(z.object({
    exerciseId: z.number(),
    orderIndex: z.number(),
    targetSets: z.number().optional(),
    targetReps: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.id, parseInt(id)),
      with: {
        exercises: {
          with: {
            exercise: true,
          },
          orderBy: (exercises, { asc }) => [asc(exercises.orderIndex)],
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return NextResponse.json({ error: 'Failed to fetch workout plan' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = workoutPlanSchema.parse(body);

    const [updatedPlan] = await db
      .update(workoutPlans)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        notes: validatedData.notes,
        updatedAt: new Date(),
      })
      .where(eq(workoutPlans.id, parseInt(id)))
      .returning();

    if (!updatedPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    if (validatedData.exercises) {
      await db.delete(workoutPlanExercises).where(eq(workoutPlanExercises.workoutPlanId, parseInt(id)));

      if (validatedData.exercises.length > 0) {
        await db.insert(workoutPlanExercises).values(
          validatedData.exercises.map((ex) => ({
            workoutPlanId: parseInt(id),
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            notes: ex.notes,
          }))
        );
      }
    }

    const planWithExercises = await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.id, parseInt(id)),
      with: {
        exercises: {
          with: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(planWithExercises);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    console.error('Error updating workout plan:', error);
    return NextResponse.json({ error: 'Failed to update workout plan' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(workoutPlans).where(eq(workoutPlans.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return NextResponse.json({ error: 'Failed to delete workout plan' }, { status: 500 });
  }
}
