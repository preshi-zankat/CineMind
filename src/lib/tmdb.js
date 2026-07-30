// src/lib/tmdb.js
// Yaha apni TMDB API key .env (project root) mein daal:
// VITE_TMDB_API_KEY=your_key_here
// Key free milti hai: https://www.themoviedb.org/settings/api
// Note: Vite mein sirf VITE_ prefix wale env vars client code mein expose hote hai

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getImageUrl(path, size = "w500") {
  if (!path) return "https://placehold.co/500x750?text=No+Image";
  return `${IMAGE_BASE}/${size}${path}`;
}

export async function getMovieDetails(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos,similar`
  );

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return res.json();
}

export async function searchMovies(query) {
  const res = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
      query
    )}`
  );

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return res.json();
}


export async function getTrendingMovies() {
  const res = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`
  );

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return res.json();
}