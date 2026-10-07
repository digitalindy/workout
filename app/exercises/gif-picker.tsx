'use client';

import { useState } from 'react';

type SearchResult = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
};

type Props = {
  defaultQuery: string;
  selectedUrl: string;
  onSelect: (gifUrl: string) => void;
};

export default function GifPicker({ defaultQuery, selectedUrl, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [searchedName, setSearchedName] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (name: string, offset = 0) => {
    if (!name) return;

    setSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ name, offset: String(offset) });
      const res = await fetch(`/api/workoutx/search?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Search failed');
        return;
      }
      setSearchedName(name);
      setResults(offset === 0 ? data.data : [...(results ?? []), ...data.data]);
      setTotal(data.total);
    } catch (error) {
      console.error('Error searching WorkoutX:', error);
      setError('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const searchQuery = () => search((query || defaultQuery).trim());

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Find a GIF on WorkoutX</span>
      </label>
      <div className="join w-full">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter would otherwise submit the surrounding exercise form
            if (e.key === 'Enter') {
              e.preventDefault();
              searchQuery();
            }
          }}
          className="input input-bordered join-item flex-1"
          placeholder={defaultQuery || 'e.g. incline bench press'}
        />
        <button
          type="button"
          onClick={searchQuery}
          disabled={searching}
          className="btn join-item"
        >
          {searching ? <span className="loading loading-spinner loading-sm"></span> : 'Search'}
        </button>
      </div>

      {error && <p className="text-error text-sm mt-2">{error}</p>}

      {results && (results.length === 0 ? (
        <p className="text-sm opacity-70 mt-2">
          No matches for &ldquo;{searchedName}&rdquo;. Try fewer words, e.g. &ldquo;incline bench&rdquo;.
        </p>
      ) : (
        <ul className="menu flex-nowrap bg-base-200 rounded-box mt-2 w-full max-h-64 overflow-y-auto">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => onSelect(result.gifUrl)}
                className={result.gifUrl === selectedUrl ? 'menu-active' : ''}
              >
                <span className="flex-1">{result.name}</span>
                <span className="text-xs opacity-60">
                  {result.equipment} · {result.target}
                </span>
              </button>
            </li>
          ))}
          {results.length < total && (
            <li>
              <button
                type="button"
                onClick={() => search(searchedName, results.length)}
                disabled={searching}
                className="justify-center opacity-70"
              >
                Show more ({total - results.length} left)
              </button>
            </li>
          )}
        </ul>
      ))}
    </div>
  );
}
