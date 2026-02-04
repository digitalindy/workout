import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Workout Tracker API',
      version: '1.0.0',
      description: `
## Overview
A REST API for tracking workouts, exercises, and workout plans.

## Data Model
- **Exercises**: Individual exercises with instructions and optional demo GIFs
- **Workout Plans**: Collections of exercises with target sets/reps and ordering
- **Workout Logs**: Records of completed workouts with actual sets performed

## Key Concepts
- Workout plans contain exercises via a junction table (WorkoutPlanExercises)
- Workout logs contain sets via WorkoutSets
- Updating a plan's exercises replaces all existing exercise mappings
- Updating a log's sets replaces all existing sets
- Deleting a plan cascades to its exercise mappings
- Deleting a log cascades to its sets

## For Claude/AI Agents
This API uses a nested/batch approach:
- To add an exercise to a plan, PUT the entire exercises array
- To add a set to a log, PUT the entire sets array
- Always fetch the current state before updating to avoid data loss
      `.trim(),
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
    ],
    tags: [
      { name: 'Exercises', description: 'Manage exercise definitions' },
      { name: 'Workout Plans', description: 'Manage workout routines/programs' },
      { name: 'Workout Logs', description: 'Record and query completed workouts' },
    ],
  });
}
