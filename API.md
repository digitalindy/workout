# Workout Tracker API Documentation

## Base URL
All API endpoints are prefixed with `/api`

## Exercises API

### GET /api/exercises
Fetch all exercises

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
