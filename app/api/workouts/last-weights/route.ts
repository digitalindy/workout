import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutSets } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseIds = searchParams.get('exerciseIds')?.split(',').map(Number) || [];

    if (exerciseIds.length === 0) {
      return NextResponse.json({});
    }

    // Get the most recent set for each exercise
    const lastWeights: Record<number, { weight: number; reps: number; setNumber: number }[]> = {};

    for (const exerciseId of exerciseIds) {
      const recentSets = await db.query.workoutSets.findMany({
        where: eq(workoutSets.exerciseId, exerciseId),
        with: {
          workoutLog: true,
        },
        orderBy: [desc(workoutSets.id)],
        limit: 10, // Get last 10 sets to find unique set numbers
      });

      if (recentSets.length > 0) {
        // Group by set number and get the most recent for each
        const setsByNumber: Record<number, typeof recentSets[0]> = {};

        for (const set of recentSets) {
          if (!setsByNumber[set.setNumber]) {
            setsByNumber[set.setNumber] = set;
          }
        }

        lastWeights[exerciseId] = Object.values(setsByNumber)
          .map(set => ({
            weight: set.weight ? parseFloat(set.weight) : 0,
            reps: set.reps,
            setNumber: set.setNumber,
          }))
          .sort((a, b) => a.setNumber - b.setNumber);
      }
    }

    return NextResponse.json(lastWeights);
  } catch (error) {
    console.error('Error fetching last weights:', error);
    return NextResponse.json({ error: 'Failed to fetch last weights' }, { status: 500 });
  }
}
