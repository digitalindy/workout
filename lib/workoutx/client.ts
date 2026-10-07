// Server-only: requests carry the WorkoutX API key. Every call counts against the
// monthly quota (500 on the free plan), so responses are kept in Next's data cache.
const BASE_URL = 'https://api.workoutxapp.com/v1';

const SEARCH_PAGE_SIZE = 10; // free plan caps results per call at 10
const SEARCH_REVALIDATE_SECONDS = 60 * 60 * 24 * 7;

export type WorkoutXExercise = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
};

export class WorkoutXError extends Error {
  constructor(public status: number) {
    super(`WorkoutX request failed with status ${status}`);
  }
}

function request(path: string, init: RequestInit = {}) {
  const apiKey = process.env.WORKOUTX_API_KEY;
  if (!apiKey) {
    throw new Error('WORKOUTX_API_KEY is not set');
  }

  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'X-WorkoutX-Key': apiKey },
  });
}

export async function searchExercises(name: string, offset = 0) {
  const params = new URLSearchParams({
    name,
    limit: String(SEARCH_PAGE_SIZE),
    offset: String(offset),
  });
  const res = await request(`/exercises?${params}`, {
    next: { revalidate: SEARCH_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new WorkoutXError(res.status);
  }

  const body: { total: number; data: WorkoutXExercise[] } = await res.json();
  return {
    total: body.total,
    data: body.data.map(({ id, name, bodyPart, target, equipment, gifUrl }) => ({
      id,
      name,
      bodyPart,
      target,
      equipment,
      gifUrl,
    })),
  };
}

export async function fetchGif(id: string) {
  const res = await request(`/gifs/${id}.gif`, { cache: 'force-cache' });
  if (!res.ok) {
    throw new WorkoutXError(res.status);
  }
  return res;
}
