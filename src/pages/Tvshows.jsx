import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Play, Tv, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  getTrendingTV,
  discoverTV,
  searchTV,
  getTVGenres,
  getImageUrl,
} from "../lib/tmdb";

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
];

const RATINGS = [
  { value: "", label: "Any Rating" },
  { value: "9", label: "9+ ⭐" },
  { value: "8", label: "8+ ⭐" },
  { value: "7", label: "7+ ⭐" },
  { value: "6", label: "6+ ⭐" },
];

export default function TVShows() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [minRating, setMinRating] = useState("");

  const [genres, setGenres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef(null);

  useEffect(() => {
    getTVGenres()
      .then(setGenres)
      .catch((err) => console.error("TV genre fetch failed:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        if (title.trim()) {
          const data = await searchTV(title.trim());
          let results = data.results || [];

          if (genre) results = results.filter((s) => s.genre_ids?.includes(Number(genre)));
          if (language) results = results.filter((s) => s.original_language === language);
          if (minRating) results = results.filter((s) => s.vote_average >= Number(minRating));

          setShows(results);
        } else {
          const noFiltersActive = !genre && !language && !minRating;
          const data = noFiltersActive
            ? await getTrendingTV()
            : await discoverTV({ genre, language, minRating });

          setShows(data.results || []);
        }
      } catch (err) {
        console.error("TV fetch failed:", err);
        setShows([]);
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
        .tv-card { animation: cardFadeUp 0.5s ease both; }
        .tv-card:hover .poster-img { transform: scale(1.08); }
        .tv-card:hover .play-overlay { opacity: 1; }
      `}</style>

      <span
        className="text-sm font-semibold flex items-center gap-2"
        style={{ color: "#7C3AED", fontFamily: "Inter" }}
      >
        <Tv size={16} />
        TV SHOWS
      </span>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-1" style={{ fontFamily: "Poppins" }}>
        {hasActiveFilters ? "Search Results" : "Trending TV Shows"}
      </h1>

      {/* Filter bar */}
      <div
        className="mt-8 rounded-2xl p-5 shadow-lg"
        style={{ background: darkMode ? "#0B1120" : "#F1F5F9" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="px-4 py-3 rounded-xl outline-none" style={selectStyle}>
            <option value="">Any Genre</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-4 py-3 rounded-xl outline-none" style={selectStyle}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

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
            className="flex items-center gap-1 mt-4 text-sm opacity-70 hover:opacity-100 transition"
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
            Loading TV shows...
          </p>
        ) : shows.length === 0 ? (
          <p className="opacity-60" style={{ fontFamily: "Inter" }}>
            Koi TV show nahi mila. Filters change karke try kar.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {shows.map((show, index) => (
              <button
                key={show.id}
                onClick={() => navigate(`/tv/${show.id}`)}
                className="tv-card text-left rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 focus:outline-none focus:ring-2"
                style={{
                  background: darkMode ? "#111827" : "#ffffff",
                  animationDelay: `${(index % 10) * 0.06}s`,
                  ringColor: "#7C3AED",
                }}
              >
                <div className="relative overflow-hidden aspect-[2/3]">
                  <img
                    src={getImageUrl(show.poster_path, "w342")}
                    alt={show.name}
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
                    {show.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70" style={{ fontFamily: "Inter" }}>
                      {show.first_air_date?.slice(0, 4) || "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      {show.vote_average?.toFixed(1)}
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