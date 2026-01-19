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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exercise Directory</h1>
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
          {showForm ? 'Cancel' : 'Add New Exercise'}
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Exercise' : 'New Exercise'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions *
                </label>
                <textarea
                  required
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={8}
                  placeholder="Detailed instructions including muscle groups, equipment needed, setup, execution, and form cues"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GIF URL
                </label>
                <input
                  type="url"
                  value={formData.gifUrl}
                  onChange={(e) => setFormData({ ...formData, gifUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/exercise.gif"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.usesWeight}
                    onChange={(e) => setFormData({ ...formData, usesWeight: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Uses Weight</span>
                </label>
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
          {exercises.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No exercises yet. Create your first one!
            </div>
          ) : (
            exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {exercise.name}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">{exercise.instructions}</p>
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
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                    >
                      Delete
                    </button>
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
