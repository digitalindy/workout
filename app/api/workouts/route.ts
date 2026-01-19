import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutLogs, workoutSets } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const workoutLogSchema = z.object({
  workoutPlanId: z.number().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
  performedAt: z.string().optional(),
  sets: z.array(z.object({
    exerciseId: z.number(),
    setNumber: z.number(),
    weight: z.number().optional(),
    reps: z.number(),
    notes: z.string().optional(),
  })),
});

export async function GET() {
  try {
    const logs = await db.query.workoutLogs.findMany({
      with: {
        workoutPlan: true,
        sets: {
          with: {
            exercise: true,
          },
          orderBy: (sets, { asc }) => [asc(sets.setNumber)],
        },
      },
      orderBy: [desc(workoutLogs.performedAt)],
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return NextResponse.json({ error: 'Failed to fetch workout logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = workoutLogSchema.parse(body);

    const [newLog] = await db
      .insert(workoutLogs)
      .values({
        workoutPlanId: validatedData.workoutPlanId,
        name: validatedData.name,
        notes: validatedData.notes,
        performedAt: validatedData.performedAt ? new Date(validatedData.performedAt) : new Date(),
      })
      .returning();

    if (validatedData.sets.length > 0) {
      await db.insert(workoutSets).values(
        validatedData.sets.map((set) => ({
          workoutLogId: newLog.id,
          exerciseId: set.exerciseId,
          setNumber: set.setNumber,
          weight: set.weight?.toString(),
          reps: set.reps,
          notes: set.notes,
        }))
      );
    }

    const logWithSets = await db.query.workoutLogs.findFirst({
      where: eq(workoutLogs.id, newLog.id),
      with: {
        workoutPlan: true,
        sets: {
          with: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(logWithSets, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    console.error('Error creating workout log:', error);
    return NextResponse.json({ error: 'Failed to create workout log' }, { status: 500 });
  }
}
