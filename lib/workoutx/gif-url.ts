const WORKOUTX_GIF_URL = /^https:\/\/api\.workoutxapp\.com\/v1\/gifs\/([a-z0-9]+)\.gif$/i;

// WorkoutX GIFs require the API key, so browsers load them through our proxy route.
// Any other URL is used as-is.
export function resolveGifUrl(gifUrl: string) {
  const match = gifUrl.match(WORKOUTX_GIF_URL);
  return match ? `/api/workoutx/gifs/${match[1]}` : gifUrl;
}
