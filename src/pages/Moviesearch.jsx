import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Play, SlidersHorizontal, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { discoverMovies, getGenres, getPopularMovies, searchMovies, getImageUrl } from "../lib/tmdb";

// TMDB ISO 639-1 language codes - list chhoti rakhi hai, zarurat pade to aur bhi add kar sakta hai
const LANGUAGES = [
  { code: "", label: "Any Language" },
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "de", label: "German" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
];

const RATINGS = [
  { value: "", label: "Any Rating" },
  { value: "9", label: "9+ ⭐" },
  { value: "8", label: "8+ ⭐" },
  { value: "7", label: "7+ ⭐" },
  { value: "6", label: "6+ ⭐" },
  { value: "5", label: "5+ ⭐" },
];

export default function MovieSearch() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [minRating, setMinRating] = useState("");

  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef(null);

  // Genre dropdown ke liye ek baar list load kar lo
  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch((err) => console.error("Genre fetch failed:", err));
  }, []);

  // Filters ya title badalne pe movies refetch - 400ms debounce ke saath
  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        // Agar title type kiya hai to search API use karo, phir baaki filters client-side apply karo
        if (title.trim()) {
          const data = await searchMovies(title.trim());
          let results = data.results || [];

          if (genre) {
            results = results.filter((m) => m.genre_ids?.includes(Number(genre)));
          }
          if (language) {
            results = results.filter((m) => m.original_language === language);
          }
          if (minRating) {
            results = results.filter((m) => m.vote_average >= Number(minRating));
          }

          setMovies(results);
        } else {
          // Title khali hai -> discover endpoint, filters server-side apply honge
          // Koi filter nahi laga to random page se popular movies dikhao
          const noFiltersActive = !genre && !language && !minRating;
          const page = noFiltersActive ? Math.floor(Math.random() * 10) + 1 : 1;

          const data = noFiltersActive
            ? await getPopularMovies(page)
            : await discoverMovies({ genre, language, minRating, page });

          setMovies(data.results || []);
        }
      } catch (err) {
        console.error("Movie fetch failed:", err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [title, genre, language, minRating]);

  const clearFilters = () => {
    setTitle("");
    setGenre("");
    setLanguage("");
    setMinRating("");
  };

  const hasActiveFilters = title || genre || language || minRating;

  const selectStyle = {
    background: darkMode ? "#111827" : "#ffffff",
    color: darkMode ? "#F8FAFC" : "#111827",
    fontFamily: "Inter",
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .movie-card { animation: cardFadeUp 0.5s ease both; }
        .movie-card:hover .poster-img { transform: scale(1.08); }
        .movie-card:hover .play-overlay { opacity: 1; }
      `}</style>

      <h1 className="text-3xl md:text-4xl font-extrabold" style={{ fontFamily: "Poppins" }}>
        Search Movies
      </h1>
      <p className="mt-2 opacity-70" style={{ fontFamily: "Inter" }}>
        Search for movies by title, genre, language, or rating.
      </p>

      {/* Filter bar */}
      <div
        className="mt-8 rounded-2xl p-5 shadow-lg"
        style={{ background: darkMode ? "#0B1120" : "#F1F5F9" }}
      >
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 font-semibold"
            style={{ color: "#7C3AED", fontFamily: "Inter" }}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm opacity-70">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div className={`${showFilters ? "grid" : "hidden"} md:grid grid-cols-1 md:grid-cols-4 gap-4`}>
          {/* Title search */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search by title..."
            className={`px-4 py-3 rounded-xl outline-none ${
              darkMode ? "text-white placeholder:text-gray-400" : "text-gray-900 placeholder:text-gray-500"
            }`}
            style={{ background: darkMode ? "#111827" : "#ffffff", fontFamily: "Inter" }}
          />

          {/* Genre */}
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="px-4 py-3 rounded-xl outline-none" style={selectStyle}>
            <option value="">Any Genre</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Language */}
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-4 py-3 rounded-xl outline-none" style={selectStyle}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Rating */}
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="px-4 py-3 rounded-xl outline-none" style={selectStyle}>
            {RATINGS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="hidden md:flex items-center gap-1 mt-4 text-sm opacity-70 hover:opacity-100 transition"
            style={{ fontFamily: "Inter" }}
          >
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-10">
        {loading ? (
          <p className="opacity-60" style={{ fontFamily: "Inter" }}>
            Loading movies...
          </p>
        ) : movies.length === 0 ? (
          <p className="opacity-60" style={{ fontFamily: "Inter" }}>
            No movies found. Try changing your filters.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {movies.map((movie, index) => (
              <button
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="movie-card text-left rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 focus:outline-none focus:ring-2"
                style={{
                  background: darkMode ? "#111827" : "#ffffff",
                  animationDelay: `${(index % 10) * 0.06}s`,
                  ringColor: "#7C3AED",
                }}
              >
                <div className="relative overflow-hidden aspect-[2/3]">
                  <img
                    src={getImageUrl(movie.poster_path, "w342")}
                    alt={movie.title}
                    className="poster-img w-full h-full object-cover transition-transform duration-500"
                  />
                  <div
                    className="play-overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
                    style={{ background: "#00000066" }}
                  >
                    <div className="p-3 rounded-full" style={{ background: "#7C3AED" }}>
                      <Play size={20} color="white" fill="white" />
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate" style={{ fontFamily: "Poppins" }}>
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70" style={{ fontFamily: "Inter" }}>
                      {movie.release_date?.slice(0, 4) || "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}