import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workoutLogs } from '@/lib/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { extractExerciseMuscleGroups } from '@/lib/exercises/metadata';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const weeksParam = parseInt(url.searchParams.get('weeks') ?? '4');
    const weeks = Number.isFinite(weeksParam) ? Math.max(1, Math.min(52, weeksParam)) : 4;
    const planIdParam = url.searchParams.get('planId');
    const planId = planIdParam ? parseInt(planIdParam) : null;
    const onlyCompleted = url.searchParams.get('onlyCompleted') !== 'false';

    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);

    const conds = [gte(workoutLogs.performedAt, since)];
    if (planId !== null && !Number.isNaN(planId)) {
      conds.push(eq(workoutLogs.workoutPlanId, planId));
    }

    const logs = await db.query.workoutLogs.findMany({
      where: conds.length === 1 ? conds[0] : and(...conds),
      with: {
        sets: { with: { exercise: true } },
      },
    });

    type MuscleRow = {
      sets: number;
      reps: number;
      volume: number;
      sessions: Set<number>;
      exercises: Set<string>;
    };
    type ExerciseRow = {
      id: number;
      name: string;
      sets: number;
      reps: number;
      volume: number;
      sessions: Set<number>;
      weights: number[];
    };

    const byMuscle: Record<string, MuscleRow> = {};
    const byExercise: Record<number, ExerciseRow> = {};

    for (const log of logs) {
      for (const s of log.sets) {
        if (onlyCompleted && !s.completed) {
          continue;
        }
        const weight = s.weight ? parseFloat(s.weight) : 0;
        const volume = weight * s.reps;

        const muscleGroups = extractExerciseMuscleGroups(s.exercise.instructions);
        for (const name of muscleGroups) {
          if (!byMuscle[name]) {
            byMuscle[name] = {
              sets: 0,
              reps: 0,
              volume: 0,
              sessions: new Set(),
              exercises: new Set(),
            };
          }
          byMuscle[name].sets += 1;
          byMuscle[name].reps += s.reps;
          byMuscle[name].volume += volume;
          byMuscle[name].sessions.add(log.id);
          byMuscle[name].exercises.add(s.exercise.name);
        }

        if (!byExercise[s.exerciseId]) {
          byExercise[s.exerciseId] = {
            id: s.exerciseId,
            name: s.exercise.name,
            sets: 0,
            reps: 0,
            volume: 0,
            sessions: new Set(),
            weights: [],
          };
        }
        byExercise[s.exerciseId].sets += 1;
        byExercise[s.exerciseId].reps += s.reps;
        byExercise[s.exerciseId].volume += volume;
        byExercise[s.exerciseId].sessions.add(log.id);
        if (weight > 0) {
          byExercise[s.exerciseId].weights.push(weight);
        }
      }
    }

    const muscleGroups = Object.entries(byMuscle)
      .map(([name, row]) => ({
        name,
        sets: row.sets,
        reps: row.reps,
        volume: Math.round(row.volume * 100) / 100,
        sessions: row.sessions.size,
        exercises: Array.from(row.exercises).sort(),
      }))
      .sort((a, b) => b.sets - a.sets);

    const exerciseRows = Object.values(byExercise)
      .map((row) => {
        const avgWeight = row.weights.length
          ? row.weights.reduce((a, b) => a + b, 0) / row.weights.length
          : null;
        return {
          id: row.id,
          name: row.name,
          sets: row.sets,
          reps: row.reps,
          volume: Math.round(row.volume * 100) / 100,
          sessions: row.sessions.size,
          maxWeight: row.weights.length ? Math.max(...row.weights) : null,
          avgWeight: avgWeight !== null ? Math.round(avgWeight * 100) / 100 : null,
        };
      })
      .sort((a, b) => b.sets - a.sets);

    return NextResponse.json({
      weeks,
      since: since.toISOString(),
      filters: { planId, onlyCompleted },
      totalSessions: logs.length,
      muscleGroups,
      exercises: exerciseRows,
    });
  } catch (error) {
    console.error('Error computing volume analytics:', error);
    return NextResponse.json({ error: 'Failed to compute volume analytics' }, { status: 500 });
  }
}
