# Workout Tracker

A reactive web application for tracking workouts built with Next.js, Tailwind CSS, Drizzle ORM, and Neon PostgreSQL.

## Features

- **Exercise Directory**: Manage a library of exercises with details about muscle groups and equipment
- **Workout Plans**: Create pre-defined workout routines with target sets and reps
- **Workout Logging**: Track actual workout sessions with weight and reps for each set
- **Reactive UI**: Built with React 19 and Tailwind CSS for a modern, responsive experience
- **Type-safe Database**: Using Drizzle ORM with TypeScript for type-safe database operations
- **RESTful API**: Complete API for programmatic access to all features

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Validation**: Zod
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)
- Neon PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file with your Neon database credentials:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

4. Push the database schema:

```bash
pnpm run db:push
```

5. Run the development server:

```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following tables:

- `exercises` - Exercise directory with name, description, muscle group, and equipment
- `workout_plans` - Pre-defined workout templates
- `workout_plan_exercises` - Exercises included in workout plans with target sets/reps
- `workout_logs` - Actual workout sessions
- `workout_sets` - Individual sets performed in a workout with weight and reps

## GIFs
- https://exrx.net/Lists/SearchExercises
- https://www.strengthlog.com/exercise-directory/ 

## API Documentation

See [API.md](./API.md) for complete API documentation with examples.

## Available Scripts

- `pnpm dev` - Run development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:push` - Push schema changes to database
- `pnpm db:generate` - Generate migrations
- `pnpm db:studio` - Open Drizzle Studio

## Usage

1. **Add Exercises**: Navigate to Exercise Directory and add exercises to your library
2. **Create Workout Plans**: Build workout routines by combining exercises with target sets/reps
3. **Log Workouts**: Record your actual workout sessions with weight and reps for each set

## License

MIT
