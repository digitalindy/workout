import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Workout Tracker
          </h1>
          <p className="text-lg sm:text-xl text-base-content/70">
            Track your workouts, manage exercises, and build your fitness journey
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Link href="/exercises" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-primary">
            <div className="card-body">
              <div className="text-4xl mb-4">💪</div>
              <h2 className="card-title">
                Exercise Directory
              </h2>
              <p>
                Manage your library of exercises with details about muscle groups and equipment
              </p>
            </div>
          </Link>

          <Link href="/plans" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-success">
            <div className="card-body">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="card-title">
                Workout Plans
              </h2>
              <p>
                Create and manage pre-defined workout routines with target sets and reps
              </p>
            </div>
          </Link>

          <Link href="/workouts" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-secondary">
            <div className="card-body">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="card-title">
                Log Workouts
              </h2>
              <p>
                Track your actual workout sessions with weight and reps for each set
              </p>
            </div>
          </Link>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-2xl mb-4">
              Getting Started
            </h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="badge badge-primary badge-lg flex-shrink-0">1</span>
                <span>
                  <strong>Add exercises</strong> to your directory with details about muscle groups and equipment
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge badge-success badge-lg flex-shrink-0">2</span>
                <span>
                  <strong>Create workout plans</strong> by combining exercises with target sets and reps
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="badge badge-secondary badge-lg flex-shrink-0">3</span>
                <span>
                  <strong>Log your workouts</strong> by recording actual weight and reps for each set
                </span>
              </li>
            </ol>
          </div>
        </div>

        <footer className="text-center mt-12 text-base-content/60">
          <p className="text-sm">
            All data is securely stored in your Neon database
          </p>
        </footer>
      </div>
    </div>
  );
}
