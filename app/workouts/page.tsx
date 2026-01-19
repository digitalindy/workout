'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Exercise = {
  id: number;
  name: string;
  usesWeight: boolean;
};

type WorkoutSet = {
  id: number;
  exerciseId: number;
  setNumber: number;
  weight?: string;
  reps: number;
  notes?: string;
  exercise: Exercise;
};

type WorkoutLog = {
  id: number;
  name?: string;
  notes?: string;
  performedAt: string;
  workoutPlan?: {
    id: number;
    name: string;
  };
  sets: WorkoutSet[];
};

type WorkoutPlan = {
  id: number;
  name: string;
  exercises: any[];
};

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    workoutPlanId: 0,
    name: '',
    notes: '',
    performedAt: new Date().toISOString().slice(0, 16),
  });
  const [sets, setSets] = useState<{
    exerciseId: number;
    setNumber: number;
    weight?: number;
    reps: number;
    notes?: string;
  }[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    fetchWorkouts();
    fetchPlans();
    fetchExercises();
    loadDraft();
  }, []);

  // Auto-save draft every 30 seconds when form is open
  useEffect(() => {
    if (!showForm || sets.length === 0) return;

    const interval = setInterval(() => {
      saveDraft();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [showForm, formData, sets]);

  // Save draft whenever sets or formData changes (debounced effect)
  useEffect(() => {
    if (!showForm || sets.length === 0) return;

    const timeout = setTimeout(() => {
      saveDraft();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeout);
  }, [formData, sets]);

  const saveDraft = () => {
    if (sets.length === 0) return;

    const draft = {
      formData,
      sets,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('workoutDraft', JSON.stringify(draft));
    setLastSaved(new Date());
    setIsDraft(true);
  };

  const loadDraft = () => {
    const saved = localStorage.getItem('workoutDraft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        const savedDate = new Date(draft.savedAt);
        const hoursSince = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);

        // Only load draft if less than 24 hours old
        if (hoursSince < 24) {
          setFormData(draft.formData);
          setSets(draft.sets);
          setLastSaved(savedDate);
          setIsDraft(true);
          setShowForm(true);
        } else {
          clearDraft();
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('workoutDraft');
    setLastSaved(null);
    setIsDraft(false);
  };

  const fetchWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts');
      const data = await res.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/workout-plans');
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/exercises');
      const data = await res.json();
      setAllExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handlePlanSelect = async (planId: number) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setFormData({ ...formData, workoutPlanId: planId, name: plan.name });

      // Get unique exercise IDs from plan
      const exerciseIds = [...new Set(plan.exercises.map(ex => ex.exerciseId))];

      // Fetch last weights for these exercises
      const lastWeights = await fetchLastWeights(exerciseIds);

      const planSets = plan.exercises.flatMap((ex) =>
        Array.from({ length: ex.targetSets || 3 }, (_, i) => {
          const setNumber = i + 1;
          const lastWeight = lastWeights[ex.exerciseId]?.find(w => w.setNumber === setNumber);

          return {
            exerciseId: ex.exerciseId,
            setNumber,
            weight: lastWeight?.weight,
            reps: lastWeight?.reps || ex.targetReps || 0,
          };
        })
      );
      setSets(planSets);
    }
  };

  const fetchLastWeights = async (exerciseIds: number[]): Promise<Record<number, { weight: number; reps: number; setNumber: number }[]>> => {
    if (exerciseIds.length === 0) return {};

    try {
      const res = await fetch(`/api/workouts/last-weights?exerciseIds=${exerciseIds.join(',')}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error('Error fetching last weights:', error);
    }
    return {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      workoutPlanId: formData.workoutPlanId || undefined,
      sets,
    };

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchWorkouts();
        clearDraft();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
      await fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        exerciseId: lastSet?.exerciseId || 0,
        setNumber: sets.length + 1,
        reps: 0,
      },
    ]);
  };

  const removeSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const updateSet = async (index: number, field: string, value: any) => {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: value };

    // If changing exercise, fetch and populate last weight/reps for that exercise
    if (field === 'exerciseId' && value > 0) {
      const lastWeights = await fetchLastWeights([value]);
      const setNumber = updated[index].setNumber;
      const lastWeight = lastWeights[value]?.find(w => w.setNumber === setNumber);

      if (lastWeight) {
        updated[index].weight = lastWeight.weight;
        updated[index].reps = lastWeight.reps;
      }
    }

    setSets(updated);
  };

  const resetForm = () => {
    if (isDraft && !confirm('You have unsaved changes. Are you sure you want to discard the draft?')) {
      return;
    }
    setFormData({
      workoutPlanId: 0,
      name: '',
      notes: '',
      performedAt: new Date().toISOString().slice(0, 16),
    });
    setSets([]);
    setShowForm(false);
    clearDraft();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workout Logs</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>

        <div className="mb-6 flex gap-3 items-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {showForm ? 'Cancel' : 'Log New Workout'}
          </button>
          {!showForm && isDraft && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              You have an unsaved draft
            </div>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Log Workout</h2>
              {isDraft && lastSaved && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Draft saved {formatTimeSince(lastSaved)}
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workout Plan (Optional)
                  </label>
                  <select
                    value={formData.workoutPlanId}
                    onChange={(e) => handlePlanSelect(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Custom Workout</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workout Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.performedAt}
                  onChange={(e) => setFormData({ ...formData, performedAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sets</label>
                    <p className="text-xs text-gray-500 mt-1">Weights/reps auto-filled from last workout</p>
                  </div>
                  <button
                    type="button"
                    onClick={addSet}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Add Set
                  </button>
                </div>

                <div className="space-y-2">
                  {sets.map((set, idx) => {
                    const exercise = allExercises.find(ex => ex.id === set.exerciseId);
                    const showWeightField = exercise?.usesWeight ?? true;

                    return (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-1 text-center font-mono text-sm text-gray-500">
                            {idx + 1}
                          </div>
                          <div className={showWeightField ? "col-span-4" : "col-span-6"}>
                            <select
                              value={set.exerciseId}
                              onChange={(e) => updateSet(idx, 'exerciseId', parseInt(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              required
                            >
                              <option value={0}>Select exercise</option>
                              {allExercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                  {ex.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {showWeightField && (
                            <div className="col-span-2">
                              <input
                                type="number"
                                step="0.5"
                                placeholder="Weight"
                                value={set.weight || ''}
                                onChange={(e) => updateSet(idx, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                title={set.weight ? 'Last used weight' : ''}
                              />
                            </div>
                          )}
                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Reps"
                              value={set.reps || ''}
                              onChange={(e) => updateSet(idx, 'reps', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              required
                              title={set.weight ? 'Last used reps' : ''}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              placeholder="Notes"
                              value={set.notes || ''}
                              onChange={(e) => updateSet(idx, 'notes', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              type="button"
                              onClick={() => removeSet(idx)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 w-full"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Complete Workout
                </button>
                <button
                  type="button"
                  onClick={() => saveDraft()}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {workouts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No workouts logged yet. Start tracking your first workout!
            </div>
          ) : (
            workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {workout.name || workout.workoutPlan?.name || 'Untitled Workout'}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(workout.performedAt)}</p>
                    {workout.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{workout.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                  >
                    Delete
                  </button>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-1">
                    {workout.sets.map((set) => (
                      <div key={set.id} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400 font-mono w-8">#{set.setNumber}</span>
                        <span className="font-medium w-40">{set.exercise.name}</span>
                        <span className="text-gray-600">
                          {set.weight && `${set.weight} lbs × `}
                          {set.reps} reps
                        </span>
                        {set.notes && <span className="text-gray-500 italic">- {set.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
