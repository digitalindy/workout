import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// ============================================
// EXERCISE SCHEMAS
// ============================================

const ExerciseSchema = registry.register(
  'Exercise',
  z.object({
    id: z.number().openapi({ description: 'Unique identifier' }),
    name: z.string().openapi({ description: 'Exercise name (unique)' }),
    instructions: z.string().openapi({ description: 'How to perform the exercise' }),
    gifUrl: z.string().nullable().openapi({ description: 'URL to demonstration GIF' }),
    usesWeight: z.boolean().openapi({ description: 'Whether this exercise uses weight' }),
    createdAt: z.string().openapi({ description: 'ISO timestamp' }),
    updatedAt: z.string().openapi({ description: 'ISO timestamp' }),
  })
);

const ExerciseCreateSchema = registry.register(
  'ExerciseCreate',
  z.object({
    name: z.string().min(1).openapi({ description: 'Exercise name (must be unique)' }),
    instructions: z.string().min(1).openapi({ description: 'How to perform the exercise' }),
    gifUrl: z.string().url().optional().openapi({ description: 'URL to demonstration GIF' }),
    usesWeight: z.boolean().optional().openapi({ description: 'Whether this exercise uses weight (default: true)' }),
  })
);

const ExerciseUpdateSchema = registry.register(
  'ExerciseUpdate',
  z.object({
    name: z.string().min(1).optional().openapi({ description: 'Exercise name' }),
    instructions: z.string().min(1).optional().openapi({ description: 'How to perform the exercise' }),
    gifUrl: z.string().url().optional().openapi({ description: 'URL to demonstration GIF' }),
    usesWeight: z.boolean().optional().openapi({ description: 'Whether this exercise uses weight' }),
  })
);

// ============================================
// WORKOUT PLAN SCHEMAS
// ============================================

const WorkoutPlanExerciseSchema = z.object({
  id: z.number(),
  workoutPlanId: z.number(),
  exerciseId: z.number(),
  orderIndex: z.number().openapi({ description: 'Order of exercise in the plan (0-indexed)' }),
  targetSets: z.number().nullable().openapi({ description: 'Target number of sets' }),
  targetReps: z.number().nullable().openapi({ description: 'Target number of reps per set' }),
  notes: z.string().nullable(),
  supersetGroup: z.number().nullable().openapi({ description: 'Group ID for superset exercises' }),
  category: z.string().nullable().openapi({ description: 'Exercise category within the plan' }),
  createdAt: z.string(),
  exercise: ExerciseSchema.openapi({ description: 'The exercise details' }),
});

const WorkoutPlanSchema = registry.register(
  'WorkoutPlan',
  z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    exercises: z.array(WorkoutPlanExerciseSchema).openapi({ description: 'Exercises in this plan with their configurations' }),
  })
);

const WorkoutPlanExerciseInputSchema = z.object({
  exerciseId: z.number().openapi({ description: 'ID of the exercise to add' }),
  orderIndex: z.number().openapi({ description: 'Order of exercise in the plan' }),
  targetSets: z.number().optional().openapi({ description: 'Target number of sets' }),
  targetReps: z.number().optional().openapi({ description: 'Target reps per set' }),
  notes: z.string().optional(),
  supersetGroup: z.number().optional().openapi({ description: 'Group ID for superset exercises' }),
  category: z.string().optional(),
});

const WorkoutPlanCreateSchema = registry.register(
  'WorkoutPlanCreate',
  z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    notes: z.string().optional(),
    exercises: z.array(WorkoutPlanExerciseInputSchema).optional().openapi({ description: 'Exercises to include in the plan' }),
  })
);

const WorkoutPlanUpdateSchema = registry.register(
  'WorkoutPlanUpdate',
  z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    exercises: z.array(WorkoutPlanExerciseInputSchema).optional().openapi({ description: 'Replaces all exercises in the plan' }),
  })
);

// ============================================
// WORKOUT LOG SCHEMAS
// ============================================

const WorkoutSetSchema = z.object({
  id: z.number(),
  workoutLogId: z.number(),
  exerciseId: z.number(),
  setNumber: z.number().openapi({ description: 'Set number (1-indexed)' }),
  weight: z.string().nullable().openapi({ description: 'Weight used (as decimal string)' }),
  reps: z.number().openapi({ description: 'Number of reps completed' }),
  notes: z.string().nullable(),
  completed: z.boolean(),
  createdAt: z.string(),
  exercise: ExerciseSchema.openapi({ description: 'The exercise details' }),
});

const WorkoutLogSchema = registry.register(
  'WorkoutLog',
  z.object({
    id: z.number(),
    workoutPlanId: z.number().nullable().openapi({ description: 'ID of the workout plan used (if any)' }),
    notes: z.string().nullable(),
    performedAt: z.string().openapi({ description: 'When the workout was performed (ISO timestamp)' }),
    createdAt: z.string(),
    workoutPlan: WorkoutPlanSchema.nullable().optional().openapi({ description: 'The workout plan used (if any)' }),
    sets: z.array(WorkoutSetSchema).openapi({ description: 'All sets performed in this workout' }),
  })
);

const WorkoutSetInputSchema = z.object({
  exerciseId: z.number().openapi({ description: 'ID of the exercise' }),
  setNumber: z.number().openapi({ description: 'Set number (1-indexed)' }),
  weight: z.number().optional().openapi({ description: 'Weight used' }),
  reps: z.number().openapi({ description: 'Number of reps' }),
  notes: z.string().optional(),
  completed: z.boolean().optional().openapi({ description: 'Whether the set was completed (default: false)' }),
});

const WorkoutLogCreateSchema = registry.register(
  'WorkoutLogCreate',
  z.object({
    workoutPlanId: z.number().optional().openapi({ description: 'ID of the workout plan being followed' }),
    notes: z.string().optional(),
    performedAt: z.string().optional().openapi({ description: 'ISO timestamp (defaults to now)' }),
    sets: z.array(WorkoutSetInputSchema).openapi({ description: 'Sets performed in this workout' }),
  })
);

const WorkoutLogUpdateSchema = registry.register(
  'WorkoutLogUpdate',
  z.object({
    workoutPlanId: z.number().optional(),
    notes: z.string().optional(),
    performedAt: z.string().optional(),
    sets: z.array(WorkoutSetInputSchema).optional().openapi({ description: 'Replaces all sets in the log' }),
  })
);

// ============================================
// COMMON SCHEMAS
// ============================================

const ErrorSchema = registry.register(
  'Error',
  z.object({
    error: z.string().openapi({ description: 'Error message' }),
  })
);

const IdParamSchema = z.object({
  id: z.string().openapi({ description: 'Resource ID' }),
});

// ============================================
// EXERCISE ENDPOINTS
// ============================================

registry.registerPath({
  method: 'get',
  path: '/api/exercises',
  summary: 'List all exercises',
  description: 'Returns all exercises ordered by name',
  tags: ['Exercises'],
  responses: {
    200: {
      description: 'List of exercises',
      content: { 'application/json': { schema: z.array(ExerciseSchema) } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/exercises',
  summary: 'Create an exercise',
  tags: ['Exercises'],
  request: {
    body: { content: { 'application/json': { schema: ExerciseCreateSchema } } },
  },
  responses: {
    201: {
      description: 'Created exercise',
      content: { 'application/json': { schema: ExerciseSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/exercises/{id}',
  summary: 'Get an exercise by ID',
  tags: ['Exercises'],
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'The exercise',
      content: { 'application/json': { schema: ExerciseSchema } },
    },
    404: {
      description: 'Exercise not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/exercises/{id}',
  summary: 'Update an exercise',
  tags: ['Exercises'],
  request: {
    params: IdParamSchema,
    body: { content: { 'application/json': { schema: ExerciseUpdateSchema } } },
  },
  responses: {
    200: {
      description: 'Updated exercise',
      content: { 'application/json': { schema: ExerciseSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Exercise not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/exercises/{id}',
  summary: 'Delete an exercise',
  tags: ['Exercises'],
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'Deletion confirmation',
      content: { 'application/json': { schema: z.object({ message: z.string() }) } },
    },
    404: {
      description: 'Exercise not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

// ============================================
// WORKOUT PLAN ENDPOINTS
// ============================================

registry.registerPath({
  method: 'get',
  path: '/api/workout-plans',
  summary: 'List all workout plans',
  description: 'Returns all workout plans with their exercises',
  tags: ['Workout Plans'],
  responses: {
    200: {
      description: 'List of workout plans',
      content: { 'application/json': { schema: z.array(WorkoutPlanSchema) } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/workout-plans',
  summary: 'Create a workout plan',
  tags: ['Workout Plans'],
  request: {
    body: { content: { 'application/json': { schema: WorkoutPlanCreateSchema } } },
  },
  responses: {
    201: {
      description: 'Created workout plan',
      content: { 'application/json': { schema: WorkoutPlanSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/workout-plans/{id}',
  summary: 'Get a workout plan by ID',
  tags: ['Workout Plans'],
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'The workout plan',
      content: { 'application/json': { schema: WorkoutPlanSchema } },
    },
    404: {
      description: 'Workout plan not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/workout-plans/{id}',
  summary: 'Update a workout plan',
  description: 'Updates a workout plan. If exercises array is provided, it replaces all existing exercises.',
  tags: ['Workout Plans'],
  request: {
    params: IdParamSchema,
    body: { content: { 'application/json': { schema: WorkoutPlanUpdateSchema } } },
  },
  responses: {
    200: {
      description: 'Updated workout plan',
      content: { 'application/json': { schema: WorkoutPlanSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Workout plan not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/workout-plans/{id}',
  summary: 'Delete a workout plan',
  description: 'Deletes a workout plan and all its associated exercises',
  tags: ['Workout Plans'],
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'Deletion confirmation',
      content: { 'application/json': { schema: z.object({ message: z.string() }) } },
    },
    404: {
      description: 'Workout plan not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

// ============================================
// WORKOUT LOG ENDPOINTS
// ============================================

registry.registerPath({
  method: 'get',
  path: '/api/workouts',
  summary: 'List all workout logs',
  description: 'Returns all workout logs with their sets, ordered by performedAt descending',
  tags: ['Workout Logs'],
  responses: {
    200: {
      description: 'List of workout logs',
      content: { 'application/json': { schema: z.array(WorkoutLogSchema) } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/workouts',
  summary: 'Create a workout log',
  description: 'Records a completed workout session with all sets',
  tags: ['Workout Logs'],
  request: {
    body: { content: { 'application/json': { schema: WorkoutLogCreateSchema } } },
  },
  responses: {
    201: {
      description: 'Created workout log',
      content: { 'application/json': { schema: WorkoutLogSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/workouts/{id}',
  summary: 'Get a workout log by ID',
  tags: ['Workout Logs'],
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'The workout log',
      content: { 'application/json': { schema: WorkoutLogSchema } },
    },
    404: {
      description: 'Workout log not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/workouts/{id}',
  summary: 'Update a workout log',
  description: 'Updates a workout log. If sets array is provided, it replaces all existing sets.',
  tags: ['Workout Logs'],
  request: {
    params: IdParamSchema,
    body: { content: { 'application/json': { schema: WorkoutLogUpdateSchema } } },
  },
  responses: {
    200: {
      description: 'Updated workout log',
      content: { 'application/json': { schema: WorkoutLogSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    404: {
      description: 'Workout log not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/workouts/{id}',
  summary: 'Delete a workout log',
  description: 'Deletes a workout log and all its associated sets',
  tags: ['Workout Logs'],
  request: { params: IdParamSchema },
  responses: {
    200: {
      description: 'Deletion confirmation',
      content: { 'application/json': { schema: z.object({ message: z.string() }) } },
    },
    404: {
      description: 'Workout log not found',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

// ============================================
// UTILITY ENDPOINTS
// ============================================

registry.registerPath({
  method: 'get',
  path: '/api/workouts/last-weights',
  summary: 'Get last recorded weights for exercises',
  description: 'Returns the most recent weight and reps for specified exercises. Useful for pre-filling workout forms.',
  tags: ['Workout Logs'],
  request: {
    query: z.object({
      exerciseIds: z.string().openapi({ description: 'Comma-separated list of exercise IDs' }),
    }),
  },
  responses: {
    200: {
      description: 'Map of exercise IDs to their last recorded weight/reps',
      content: {
        'application/json': {
          schema: z.record(
            z.string(),
            z.object({
              weight: z.string().nullable(),
              reps: z.number(),
            })
          ),
        },
      },
    },
    400: {
      description: 'Missing exerciseIds parameter',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});
