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
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Workout Plans</h1>
          <Link href="/" className="btn btn-neutral">
            Back to Home
          </Link>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary mb-6"
        >
          {showForm ? 'Cancel' : 'Create New Plan'}
        </button>

        {showForm && (
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title">
                {editingId ? 'Edit Plan' : 'New Plan'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Plan Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="textarea textarea-bordered"
                    rows={2}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Notes</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="textarea textarea-bordered"
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="label">
                      <span className="label-text">Exercises</span>
                    </label>
                    <button
                      type="button"
                      onClick={addExercise}
                      className="btn btn-success btn-sm"
                    >
                      Add Exercise
                    </button>
                  </div>

                  {selectedExercises.map((ex, idx) => (
                    <div key={idx} className="bg-base-200 p-4 rounded-lg mb-2">
                      <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 items-stretch sm:items-start">
                        <div className="sm:col-span-4">
                          <select
                            value={ex.exerciseId}
                            onChange={(e) => updateExercise(idx, 'exerciseId', parseInt(e.target.value))}
                            className="select select-bordered w-full select-sm"
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
                        <div className="flex gap-2 sm:contents">
                          <div className="flex-1 sm:col-span-2">
                            <input
                              type="number"
                              placeholder="Sets"
                              value={ex.targetSets || ''}
                              onChange={(e) => updateExercise(idx, 'targetSets', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                          <div className="flex-1 sm:col-span-2">
                            <input
                              type="number"
                              placeholder="Reps"
                              value={ex.targetReps || ''}
                              onChange={(e) => updateExercise(idx, 'targetReps', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            placeholder="Notes"
                            value={ex.notes || ''}
                            onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <button
                            type="button"
                            onClick={() => removeExercise(idx)}
                            className="btn btn-error btn-sm w-full"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-ghost">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {plans.length === 0 ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <p>No workout plans yet. Create your first one!</p>
              </div>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="card-title mb-2">{plan.name}</h3>
                      {plan.description && (
                        <p className="mb-2">{plan.description}</p>
                      )}
                      {plan.notes && (
                        <p className="text-sm opacity-70 italic mb-3">{plan.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="btn btn-warning btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="btn btn-error btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div>
                    <h4 className="font-semibold mb-2">Exercises:</h4>
                    <div className="space-y-2">
                      {plan.exercises.map((ex, idx) => (
                        <div key={ex.id} className="flex items-center gap-3 text-sm">
                          <span className="badge badge-neutral">{idx + 1}</span>
                          <span className="font-medium">{ex.exercise.name}</span>
                          {(ex.targetSets || ex.targetReps) && (
                            <span className="opacity-70">
                              {ex.targetSets && `${ex.targetSets} sets`}
                              {ex.targetSets && ex.targetReps && ' × '}
                              {ex.targetReps && `${ex.targetReps} reps`}
                            </span>
                          )}
                          {ex.notes && (
                            <span className="opacity-60 italic">- {ex.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
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
