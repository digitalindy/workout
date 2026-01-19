'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Exercise = {
  id: number;
  name: string;
  instructions: string;
  gifUrl?: string | null;
  usesWeight: boolean;
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    instructions: '',
    gifUrl: '',
    usesWeight: true,
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await fetch('/api/exercises');
      const data = await res.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId ? `/api/exercises/${editingId}` : '/api/exercises';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchExercises();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      name: exercise.name,
      instructions: exercise.instructions,
      gifUrl: exercise.gifUrl || '',
      usesWeight: exercise.usesWeight,
    });
    setEditingId(exercise.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      await fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', instructions: '', gifUrl: '', usesWeight: true });
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
          <h1 className="text-3xl font-bold">Exercise Directory</h1>
          <Link href="/" className="btn btn-neutral">
            Back to Home
          </Link>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary mb-6"
        >
          {showForm ? 'Cancel' : 'Add New Exercise'}
        </button>

        {showForm && (
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title">
                {editingId ? 'Edit Exercise' : 'New Exercise'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name *</span>
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
                    <span className="label-text">Instructions *</span>
                  </label>
                  <textarea
                    required
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="textarea textarea-bordered"
                    rows={8}
                    placeholder="Detailed instructions including muscle groups, equipment needed, setup, execution, and form cues"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">GIF URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.gifUrl}
                    onChange={(e) => setFormData({ ...formData, gifUrl: e.target.value })}
                    className="input input-bordered"
                    placeholder="https://example.com/exercise.gif"
                  />
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      checked={formData.usesWeight}
                      onChange={(e) => setFormData({ ...formData, usesWeight: e.target.checked })}
                      className="checkbox"
                    />
                    <span className="label-text">Uses Weight</span>
                  </label>
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
          {exercises.length === 0 ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <p>No exercises yet. Create your first one!</p>
              </div>
            </div>
          ) : (
            exercises.map((exercise) => (
              <div key={exercise.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h3 className="card-title mb-3">
                        {exercise.name}
                      </h3>
                      <p className="whitespace-pre-line">{exercise.instructions}</p>
                    </div>
                    {exercise.gifUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={exercise.gifUrl}
                          alt={exercise.name}
                          className="w-48 h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(exercise)}
                        className="btn btn-warning btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="btn btn-error btn-sm"
                      >
                        Delete
                      </button>
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
