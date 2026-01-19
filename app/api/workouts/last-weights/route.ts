import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutSets } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseIds = searchParams.get('exerciseIds')?.split(',').map(Number) || [];

    if (exerciseIds.length === 0) {
      return NextResponse.json({});
    }

    // Get the most recent sets for all exercises in a single query
    const allRecentSets = await db.query.workoutSets.findMany({
      where: inArray(workoutSets.exerciseId, exerciseIds),
      with: {
        workoutLog: true,
      },
      orderBy: [desc(workoutSets.id)],
    });

    // Group by exercise and then by set number
    const lastWeights: Record<number, { weight: number; reps: number; setNumber: number }[]> = {};

    for (const exerciseId of exerciseIds) {
      const exerciseSets = allRecentSets
        .filter(set => set.exerciseId === exerciseId)
        .slice(0, 10); // Get last 10 sets to find unique set numbers

      if (exerciseSets.length > 0) {
        // Group by set number and get the most recent for each
        const setsByNumber: Record<number, typeof exerciseSets[0]> = {};

        for (const set of exerciseSets) {
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
