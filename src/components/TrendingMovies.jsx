import { Star, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrendingMovies, getImageUrl } from "../lib/tmdb";
import { useTheme } from "../context/ThemeContext";

export default function TrendingMovies({ onSelect }) {
  const { darkMode } = useTheme();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const data = await getTrendingMovies();
        setTrendingMovies(data.results?.slice(0, 6) || []);
      } catch (err) {
        console.error("Trending fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  const handleClick = (movie) => {
    if (onSelect) {
      onSelect(movie);
    } else {
      console.log("Movie clicked:", movie.title);
    }
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <p className="opacity-60" style={{ fontFamily: "Inter" }}>
          Loading trending movies...
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .movie-card {
          animation: cardFadeUp 0.6s ease both;
        }
        .movie-card:hover .poster-img {
          transform: scale(1.08);
        }
        .movie-card:hover .play-overlay {
          opacity: 1;
        }
      `}</style>

      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
        <div>
          <span
            className="text-xs sm:text-sm font-semibold"
            style={{ color: "#7C3AED", fontFamily: "Inter" }}
          >
            THIS WEEK
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-1"
            style={{ fontFamily: "Poppins" }}
          >
            Trending Movies
          </h2>
        </div>
        <Link
          to="/trending"
          className="font-semibold hover:opacity-70 transition text-sm sm:text-base shrink-0"
          style={{ color: "#7C3AED", fontFamily: "Inter" }}
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {trendingMovies.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => handleClick(movie)}
            className="movie-card text-left rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 focus:outline-none focus:ring-2"
            style={{
              background: darkMode ? "#111827" : "#ffffff",
              animationDelay: `${index * 0.08}s`,
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
                <div
                  className="p-3 rounded-full"
                  style={{ background: "#7C3AED" }}
                >
                  <Play size={20} color="white" fill="white" />
                </div>
              </div>
            </div>

            <div className="p-3">
              <h3
                className="font-semibold text-sm truncate"
                style={{ fontFamily: "Poppins" }}
              >
                {movie.title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70" style={{ fontFamily: "Inter" }}>
                  {movie.release_date?.slice(0, 4)}
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
    </section>
  );
}