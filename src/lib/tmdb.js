
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getImageUrl(path, size = "w500") {
  if (!path) return "https://placehold.co/500x750?text=No+Image";
  return `${IMAGE_BASE}/${size}${path}`;
}

export async function getMovieDetails(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos,similar,watch/providers`
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

export async function getGenres() {
  const res = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
  );

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.genres || [];
}

export async function getPopularMovies(page = 1) {
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`
  );

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return res.json();
}

export async function discoverMovies({ genre, language, minRating, page = 1 } = {}) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "en-US",
    sort_by: "popularity.desc",
    page: String(page),
  });

  if (genre) params.set("with_genres", genre);
  if (language) params.set("with_original_language", language);
  if (minRating) params.set("vote_average.gte", String(minRating));

  const res = await fetch(`${BASE_URL}/discover/movie?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return res.json();
}

export async function getTrendingByCountry(countryCode, page = 1) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "en-US",
    sort_by: "popularity.desc",
    with_origin_country: countryCode,
    page: String(page),
  });

  const res = await fetch(`${BASE_URL}/discover/movie?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }

  return res.json();
}