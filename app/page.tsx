import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Workout Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Track your workouts, manage exercises, and build your fitness journey
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Link
            href="/exercises"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-blue-500"
          >
            <div className="text-4xl mb-4">💪</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Exercise Directory
            </h2>
            <p className="text-gray-600">
              Manage your library of exercises with details about muscle groups and equipment
            </p>
          </Link>

          <Link
            href="/plans"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-green-500"
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Workout Plans
            </h2>
            <p className="text-gray-600">
              Create and manage pre-defined workout routines with target sets and reps
            </p>
          </Link>

          <Link
            href="/workouts"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-purple-500"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Log Workouts
            </h2>
            <p className="text-gray-600">
              Track your actual workout sessions with weight and reps for each set
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Getting Started
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
              <span>
                <strong>Add exercises</strong> to your directory with details about muscle groups and equipment
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-green-600 flex-shrink-0">2.</span>
              <span>
                <strong>Create workout plans</strong> by combining exercises with target sets and reps
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>
                <strong>Log your workouts</strong> by recording actual weight and reps for each set
              </span>
            </li>
          </ol>
        </div>

        <footer className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            All data is securely stored in your Neon database
          </p>
        </footer>
      </div>
    </div>
  );
}
