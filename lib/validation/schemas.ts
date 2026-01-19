import { z } from 'zod';

export const exerciseSchema = z.object({
  name: z.string().min(1),
  instructions: z.string().min(1),
  gifUrl: z.string().url().optional().or(z.literal('')),
  usesWeight: z.boolean().optional(),
});

export const exerciseUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  gifUrl: z.string().url().optional().or(z.literal('')),
  usesWeight: z.boolean().optional(),
});

export const workoutPlanSchema = z.object({
  name: z.string().min(1),
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

export const workoutPlanUpdateSchema = z.object({
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

export const workoutLogSchema = z.object({
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

export const workoutLogUpdateSchema = z.object({
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
  })).optional(),
});
