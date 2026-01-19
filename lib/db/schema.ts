import { pgTable, serial, varchar, text, integer, decimal, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  instructions: text('instructions').notNull(),
  gifUrl: varchar('gif_url', { length: 500 }),
  usesWeight: boolean('uses_weight').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workoutPlans = pgTable('workout_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workoutPlanExercises = pgTable('workout_plan_exercises', {
  id: serial('id').primaryKey(),
  workoutPlanId: integer('workout_plan_id').notNull().references(() => workoutPlans.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull(),
  targetSets: integer('target_sets'),
  targetReps: integer('target_reps'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutLogs = pgTable('workout_logs', {
  id: serial('id').primaryKey(),
  workoutPlanId: integer('workout_plan_id').references(() => workoutPlans.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }),
  notes: text('notes'),
  performedAt: timestamp('performed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workoutSets = pgTable('workout_sets', {
  id: serial('id').primaryKey(),
  workoutLogId: integer('workout_log_id').notNull().references(() => workoutLogs.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  reps: integer('reps').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutPlanExercises: many(workoutPlanExercises),
  workoutSets: many(workoutSets),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ many }) => ({
  exercises: many(workoutPlanExercises),
  workoutLogs: many(workoutLogs),
}));

export const workoutPlanExercisesRelations = relations(workoutPlanExercises, ({ one }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [workoutPlanExercises.workoutPlanId],
    references: [workoutPlans.id],
  }),
  exercise: one(exercises, {
    fields: [workoutPlanExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one, many }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [workoutLogs.workoutPlanId],
    references: [workoutPlans.id],
  }),
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  workoutLog: one(workoutLogs, {
    fields: [workoutSets.workoutLogId],
    references: [workoutLogs.id],
  }),
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }),
}));
