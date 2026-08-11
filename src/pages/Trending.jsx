import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Play, Globe } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getTrendingMovies, getTrendingByCountry, getImageUrl } from "../lib/tmdb";

// ISO 3166-1 country codes - list chhoti rakhi hai, zarurat pade to aur add kar sakta hai
const COUNTRIES = [
  { code: "", label: "🌍 Worldwide" },
  { code: "US", label: "🇺🇸 United States" },
  { code: "IN", label: "🇮🇳 India" },
  { code: "GB", label: "🇬🇧 United Kingdom" },
  { code: "FR", label: "🇫🇷 France" },
  { code: "JP", label: "🇯🇵 Japan" },
  { code: "KR", label: "🇰🇷 South Korea" },
  { code: "CN", label: "🇨🇳 China" },
  { code: "DE", label: "🇩🇪 Germany" },
  { code: "ES", label: "🇪🇸 Spain" },
  { code: "IT", label: "🇮🇹 Italy" },
  { code: "BR", label: "🇧🇷 Brazil" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "AU", label: "🇦🇺 Australia" },
];

export default function Trending() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [country, setCountry] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchMovies = country
      ? getTrendingByCountry(country)
      : getTrendingMovies();

    fetchMovies
      .then((data) => setMovies(data.results || []))
      .catch((err) => {
        console.error("Trending fetch failed:", err);
        setMovies([]);
      })
      .finally(() => setLoading(false));
  }, [country]);

  const selectedLabel = COUNTRIES.find((c) => c.code === country)?.label || "🌍 Worldwide";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .movie-card { animation: cardFadeUp 0.5s ease both; }
        .movie-card:hover .poster-img { transform: scale(1.08); }
        .movie-card:hover .play-overlay { opacity: 1; }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: "#7C3AED", fontFamily: "Inter" }}
          >
            <Globe size={16} />
            TRENDING NOW
          </span>
          <h1
            className="text-3xl md:text-4xl font-extrabold mt-1"
            style={{ fontFamily: "Poppins" }}
          >
            {country ? `Trending in ${selectedLabel.replace(/^\S+\s/, "")}` : "Trending Worldwide"}
          </h1>
        </div>

        {/* Country selector */}
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-5 py-3 rounded-full outline-none font-medium shadow-sm w-full md:w-auto"
          style={{
            background: darkMode ? "#111827" : "#ffffff",
            color: darkMode ? "#F8FAFC" : "#111827",
            fontFamily: "Inter",
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code || "world"} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="mt-10">
        {loading ? (
          <p className="opacity-60" style={{ fontFamily: "Inter" }}>
            Loading movies...
          </p>
        ) : movies.length === 0 ? (
          <p className="opacity-60" style={{ fontFamily: "Inter" }}>
            No movies found for the selected country. Try another country or check back later.
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