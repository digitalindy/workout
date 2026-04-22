# Workout Tracker API Documentation

## Base URL
All API endpoints are prefixed with `/api`

The live Swagger UI is at `/docs` and the raw OpenAPI spec is at `/api/openapi.json` — prefer those over this file when they disagree.

## Exercises API

### GET /api/exercises
Fetch all exercises. Supports optional filtering.

**Query parameters (all optional, case-insensitive substring match):**
- `muscleGroup` — match against any listed muscle group (e.g. `chest`, `glutes`, `triceps`)
- `equipment` — match against equipment (e.g. `dumbbell`, `bodyweight`, `resistance band`)

Filters are parsed from the `**Muscle Groups:**` and `**Equipment:**` lines of each exercise's `instructions`. An exercise that lists multiple muscles is returned if any one matches.

```bash
# all dumbbell exercises
curl "$BASE/api/exercises?equipment=dumbbell"

# all chest exercises (primary or secondary)
curl "$BASE/api/exercises?muscleGroup=chest"

# dumbbell chest exercises
curl "$BASE/api/exercises?muscleGroup=chest&equipment=dumbbell"
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bench Press",
    "description": "Chest exercise",
    "muscleGroup": "Chest",
    "equipment": "Barbell",
    "createdAt": "2025-01-19T...",
    "updatedAt": "2025-01-19T..."
  }
]
```

### POST /api/exercises
Create a new exercise

**Request Body:**
```json
{
  "name": "Bench Press",
  "description": "Chest exercise",
  "muscleGroup": "Chest",
  "equipment": "Barbell"
}
```

**Response:** Created exercise object (201)

### GET /api/exercises/:id
Fetch a single exercise

**Response:** Exercise object

### PUT /api/exercises/:id
Update an exercise

**Request Body:**
```json
{
  "name": "Updated name",
  "description": "Updated description",
  "muscleGroup": "Chest",
  "equipment": "Barbell"
}
```

**Response:** Updated exercise object

### DELETE /api/exercises/:id
Delete an exercise

**Response:**
```json
{ "success": true }
```

---

## Workout Plans API

### GET /api/workout-plans
Fetch all workout plans with exercises

**Response:**
```json
[
  {
    "id": 1,
    "name": "Push Day",
    "description": "Chest, shoulders, triceps",
    "notes": "3x per week",
    "exercises": [
      {
        "id": 1,
        "exerciseId": 1,
        "orderIndex": 0,
        "targetSets": 3,
        "targetReps": 10,
        "notes": "Progressive overload",
        "exercise": {
          "id": 1,
          "name": "Bench Press",
          "muscleGroup": "Chest"
        }
      }
    ],
    "createdAt": "2025-01-19T...",
    "updatedAt": "2025-01-19T..."
  }
]
```

### POST /api/workout-plans
Create a new workout plan

**Request Body:**
```json
{
  "name": "Push Day",
  "description": "Chest, shoulders, triceps",
  "notes": "3x per week",
  "exercises": [
    {
      "exerciseId": 1,
      "orderIndex": 0,
      "targetSets": 3,
      "targetReps": 10,
      "notes": "Progressive overload"
    }
  ]
}
```

**Response:** Created workout plan with exercises (201)

### GET /api/workout-plans/:id
Fetch a single workout plan with exercises

**Response:** Workout plan object with exercises

### PUT /api/workout-plans/:id
Update a workout plan

**Request Body:** Same as POST

**Response:** Updated workout plan object

### DELETE /api/workout-plans/:id
Delete a workout plan (cascades to exercises)

**Response:**
```json
{ "success": true }
```

### PATCH /api/workout-plans/:id/exercises/:orderIndex
Update one exercise slot without resending the whole exercises array. Only include fields you want to change.

**Request Body (all fields optional):**
```json
{
  "exerciseId": 50,
  "targetSets": 4,
  "targetReps": 8,
  "notes": "Drop set on last one",
  "supersetGroup": 2,
  "category": "main",
  "orderIndex": 5
}
```

**Response:** The updated slot with full exercise details.

**Errors:** 400 if no fields supplied or ids are non-numeric; 404 if no slot exists at that orderIndex for that plan.

### DELETE /api/workout-plans/:id/exercises/:orderIndex
Remove a single exercise slot from a plan by orderIndex. Remaining slots are NOT renumbered — re-PUT the plan if you need contiguous indices.

**Response:**
```json
{ "success": true }
```

---

## Analytics API

### GET /api/analytics/volume
Rolling-window rollup of sets/reps/volume by muscle group and by exercise. Useful for spotting under- or overtrained muscles without pulling every log.

**Query parameters:**
- `weeks` (optional, default `4`, range `1-52`) — window size
- `planId` (optional) — restrict to workouts performed for a specific plan
- `onlyCompleted` (optional, default `true`) — set to `false` to include un-checked sets

Muscle groups are parsed from each exercise's `**Muscle Groups:**` line. An exercise hitting three muscles contributes to three muscle-group rows.

```bash
# last 4 weeks, all plans
curl "$BASE/api/analytics/volume"

# last 8 weeks, push day only
curl "$BASE/api/analytics/volume?weeks=8&planId=2"
```

**Response:**
```json
{
  "weeks": 4,
  "since": "2026-03-24T...",
  "filters": { "planId": null, "onlyCompleted": true },
  "totalSessions": 8,
  "muscleGroups": [
    { "name": "Chest", "sets": 24, "reps": 240, "volume": 9600, "sessions": 4, "exercises": ["Flat Dumbbell Bench", "Incline Dumbbell Bench"] }
  ],
  "exercises": [
    { "id": 6, "name": "Flat Dumbbell Bench", "sets": 16, "reps": 128, "volume": 5120, "sessions": 4, "maxWeight": 45, "avgWeight": 42.5 }
  ]
}
```

---

## Workout Logs API

### GET /api/workouts
Fetch all workout logs with sets

**Response:**
```json
[
  {
    "id": 1,
    "workoutPlanId": 1,
    "name": "Push Day",
    "notes": "Felt strong today",
    "performedAt": "2025-01-19T10:00:00Z",
    "workoutPlan": {
      "id": 1,
      "name": "Push Day"
    },
    "sets": [
      {
        "id": 1,
        "exerciseId": 1,
        "setNumber": 1,
        "weight": "135.00",
        "reps": 10,
        "notes": "Warmup",
        "exercise": {
          "id": 1,
          "name": "Bench Press"
        }
      }
    ],
    "createdAt": "2025-01-19T..."
  }
]
```

### POST /api/workouts
Log a new workout

**Request Body:**
```json
{
  "workoutPlanId": 1,
  "name": "Push Day",
  "notes": "Felt strong today",
  "performedAt": "2025-01-19T10:00:00Z",
  "sets": [
    {
      "exerciseId": 1,
      "setNumber": 1,
      "weight": 135,
      "reps": 10,
      "notes": "Warmup"
    },
    {
      "exerciseId": 1,
      "setNumber": 2,
      "weight": 185,
      "reps": 8
    }
  ]
}
```

**Response:** Created workout log with sets (201)

### GET /api/workouts/:id
Fetch a single workout log with sets

**Response:** Workout log object with sets

### PUT /api/workouts/:id
Update a workout log

**Request Body:** Same as POST

**Response:** Updated workout log object

### DELETE /api/workouts/:id
Delete a workout log (cascades to sets)

**Response:**
```json
{ "success": true }
```

---

## Example Usage

### Add a workout using the API

```bash
# 1. Create an exercise
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Squat",
    "muscleGroup": "Legs",
    "equipment": "Barbell"
  }'

# 2. Create a workout plan
curl -X POST http://localhost:3000/api/workout-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Leg Day",
    "exercises": [
      {
        "exerciseId": 1,
        "orderIndex": 0,
        "targetSets": 4,
        "targetReps": 8
      }
    ]
  }'

# 3. Log a workout
curl -X POST http://localhost:3000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "workoutPlanId": 1,
    "name": "Leg Day",
    "sets": [
      {
        "exerciseId": 1,
        "setNumber": 1,
        "weight": 225,
        "reps": 8
      }
    ]
  }'
```
