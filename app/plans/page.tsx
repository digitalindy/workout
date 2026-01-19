'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Exercise = {
  id: number;
  name: string;
  instructions: string;
};

type PlanExercise = {
  id: number;
  exerciseId: number;
  orderIndex: number;
  targetSets?: number;
  targetReps?: number;
  notes?: string;
  exercise: Exercise;
};

type WorkoutPlan = {
  id: number;
  name: string;
  description?: string;
  notes?: string;
  exercises: PlanExercise[];
};

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    notes: '',
  });
  const [selectedExercises, setSelectedExercises] = useState<{
    exerciseId: number;
    targetSets?: number;
    targetReps?: number;
    notes?: string;
  }[]>([]);

  useEffect(() => {
    fetchPlans();
    fetchExercises();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/workout-plans');
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      exercises: selectedExercises.map((ex, idx) => ({
        ...ex,
        orderIndex: idx,
      })),
    };

    const url = editingId ? `/api/workout-plans/${editingId}` : '/api/workout-plans';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchPlans();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEdit = (plan: WorkoutPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description || '',
      notes: plan.notes || '',
    });
    setSelectedExercises(
      plan.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        targetSets: ex.targetSets || undefined,
        targetReps: ex.targetReps || undefined,
        notes: ex.notes || undefined,
      }))
    );
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;

    try {
      await fetch(`/api/workout-plans/${id}`, { method: 'DELETE' });
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const addExercise = () => {
    setSelectedExercises([...selectedExercises, { exerciseId: 0 }]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', notes: '' });
    setSelectedExercises([]);
    setEditingId(null);
    setShowForm(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Workout Plans</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {showForm ? 'Cancel' : 'Create New Plan'}
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Plan' : 'New Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Exercises</label>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Add Exercise
                  </button>
                </div>

                {selectedExercises.map((ex, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-2">
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-4">
                        <select
                          value={ex.exerciseId}
                          onChange={(e) => updateExercise(idx, 'exerciseId', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          required
                        >
                          <option value={0}>Select exercise</option>
                          {allExercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Sets"
                          value={ex.targetSets || ''}
                          onChange={(e) => updateExercise(idx, 'targetSets', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Reps"
                          value={ex.targetReps || ''}
                          onChange={(e) => updateExercise(idx, 'targetReps', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Notes"
                          value={ex.notes || ''}
                          onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeExercise(idx)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 w-full"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No workout plans yet. Create your first one!
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-gray-600 mb-2">{plan.description}</p>
                    )}
                    {plan.notes && (
                      <p className="text-sm text-gray-500 italic mb-3">{plan.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Exercises:</h4>
                  <div className="space-y-2">
                    {plan.exercises.map((ex, idx) => (
                      <div key={ex.id} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400 font-mono">{idx + 1}.</span>
                        <span className="font-medium">{ex.exercise.name}</span>
                        {(ex.targetSets || ex.targetReps) && (
                          <span className="text-gray-600">
                            {ex.targetSets && `${ex.targetSets} sets`}
                            {ex.targetSets && ex.targetReps && ' × '}
                            {ex.targetReps && `${ex.targetReps} reps`}
                          </span>
                        )}
                        {ex.notes && (
                          <span className="text-gray-500 italic">- {ex.notes}</span>
                        )}
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
