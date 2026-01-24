import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutPlans, workoutPlanExercises } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { workoutPlanSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    const plans = await db.query.workoutPlans.findMany({
      with: {
        exercises: {
          with: {
            exercise: true,
          },
          orderBy: (exercises, { asc }) => [asc(exercises.orderIndex)],
        },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return NextResponse.json({ error: 'Failed to fetch workout plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = workoutPlanSchema.parse(body);

    const [newPlan] = await db
      .insert(workoutPlans)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        notes: validatedData.notes,
      })
      .returning();

    if (validatedData.exercises && validatedData.exercises.length > 0) {
      await db.insert(workoutPlanExercises).values(
        validatedData.exercises.map((ex) => ({
          workoutPlanId: newPlan.id,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          notes: ex.notes,
          supersetGroup: ex.supersetGroup,
          category: ex.category,
        }))
      );
    }

    const planWithExercises = await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.id, newPlan.id),
      with: {
        exercises: {
          with: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(planWithExercises, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    console.error('Error creating workout plan:', error);
    return NextResponse.json({ error: 'Failed to create workout plan' }, { status: 500 });
  }
}
