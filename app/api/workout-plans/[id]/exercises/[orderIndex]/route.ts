import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutPlans, workoutPlanExercises } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { workoutPlanExercisePatchSchema } from '@/lib/validation/schemas';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; orderIndex: string }> }
) {
  try {
    const { id, orderIndex } = await params;
    const planId = parseInt(id);
    const idx = parseInt(orderIndex);

    if (Number.isNaN(planId) || Number.isNaN(idx)) {
      return NextResponse.json({ error: 'Invalid id or orderIndex' }, { status: 400 });
    }

    const body = await request.json();
    const data = workoutPlanExercisePatchSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const [updated] = await db
      .update(workoutPlanExercises)
      .set(data)
      .where(
        and(
          eq(workoutPlanExercises.workoutPlanId, planId),
          eq(workoutPlanExercises.orderIndex, idx)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: `No exercise at orderIndex ${idx} in plan ${planId}` },
        { status: 404 }
      );
    }

    await db
      .update(workoutPlans)
      .set({ updatedAt: new Date() })
      .where(eq(workoutPlans.id, planId));

    const slot = await db.query.workoutPlanExercises.findFirst({
      where: eq(workoutPlanExercises.id, updated.id),
      with: { exercise: true },
    });

    return NextResponse.json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    console.error('Error patching workout plan exercise:', error);
    return NextResponse.json({ error: 'Failed to update exercise slot' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; orderIndex: string }> }
) {
  try {
    const { id, orderIndex } = await params;
    const planId = parseInt(id);
    const idx = parseInt(orderIndex);

    if (Number.isNaN(planId) || Number.isNaN(idx)) {
      return NextResponse.json({ error: 'Invalid id or orderIndex' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(workoutPlanExercises)
      .where(
        and(
          eq(workoutPlanExercises.workoutPlanId, planId),
          eq(workoutPlanExercises.orderIndex, idx)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: `No exercise at orderIndex ${idx} in plan ${planId}` },
        { status: 404 }
      );
    }

    await db
      .update(workoutPlans)
      .set({ updatedAt: new Date() })
      .where(eq(workoutPlans.id, planId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout plan exercise:', error);
    return NextResponse.json({ error: 'Failed to delete exercise slot' }, { status: 500 });
  }
}
