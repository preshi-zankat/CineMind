import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Play, Bookmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getWatchlist, removeFromWatchlist, updateWatchlistStatus } from "../appwrite/watchlist";
import { getImageUrl } from "../lib/tmdb";
import toast from "react-hot-toast";

export default function WatchList() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadWatchlist() {
      try {
        const data = await getWatchlist(user.$id);
        setWatchlist(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadWatchlist();
  }, [user]);

  const handleCardClick = (item) => {
    const path = item.contentType === "tv" ? "/tv" : "/movie";
    navigate(`${path}/${item.contentId}`);
  };

  const handleRemove = async (e, movie) => {
    e.stopPropagation(); // card click trigger na ho
    try {
      await removeFromWatchlist(movie.$id);
      setWatchlist((prev) => prev.filter((m) => m.$id !== movie.$id));
      toast.success("Removed from watchlist.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove.");
    }
  };

  const handleStatusChange = async (e, movie) => {
    e.stopPropagation(); // card click trigger na ho
    const newStatus = e.target.value;
    try {
      await updateWatchlistStatus(movie.$id, newStatus);
      setWatchlist((prev) =>
        prev.map((m) => (m.$id === movie.$id ? { ...m, status: newStatus } : m))
      );
      toast.success(`Marked as "${newStatus}"`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p style={{ fontFamily: "Inter" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .movie-card { animation: cardFadeUp 0.6s ease both; }
        .movie-card:hover .poster-img { transform: scale(1.08); }
        .movie-card:hover .play-overlay { opacity: 1; }
      `}</style>

      <h1
        className="text-3xl font-extrabold mb-8 flex items-center gap-2"
        style={{ fontFamily: "Poppins" }}
      >
        <Bookmark size={28} style={{ color: "#7C3AED" }} fill="#7C3AED" />
        My Watchlist
      </h1>

      {watchlist.length === 0 ? (
        <h2 className="opacity-70" style={{ fontFamily: "Inter" }}>
          Your watchlist is empty. Start adding movies or shows to keep track of what you want to watch!
        </h2>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {watchlist.map((movie, index) => (
            <div
              key={movie.$id}
              onClick={() => handleCardClick(movie)}
              className="movie-card cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2"
              style={{
                background: darkMode ? "#111827" : "#ffffff",
                animationDelay: `${index * 0.08}s`,
              }}
            >
              <div className="relative overflow-hidden aspect-[2/3]">
                <img
                  src={getImageUrl(movie.poster)}
                  alt={movie.title}
                  className="poster-img w-full h-full object-cover transition-transform duration-500"
                />
                <span
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md"
                  style={{ background: "#00000080", color: "white" }}
                >
                  {movie.contentType === "tv" ? "TV" : "MOVIE"}
                </span>
                <div
                  className="play-overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
                  style={{ background: "#00000066" }}
                >
                  <div className="p-3 rounded-full" style={{ background: "#7C3AED" }}>
                    <Play size={20} color="white" fill="white" />
                  </div>
                </div>

                {/* Remove button - card ke upar right corner mein */}
                <button
                  onClick={(e) => handleRemove(e, movie)}
                  className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md transition hover:scale-105"
                  style={{ background: "#00000080", color: "white" }}
                >
                  Remove
                </button>
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
                    {movie.releaseDate?.slice(0, 4) || "—"}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    {movie.rating?.toFixed ? movie.rating.toFixed(1) : movie.rating}
                  </span>
                </div>

                {/* Status dropdown - card click se bachane ke liye stopPropagation */}
                <select
                  value={movie.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleStatusChange(e, movie)}
                  className="mt-2 w-full text-xs font-medium rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                  style={{
                    background: darkMode ? "#1F2937" : "#F1F5F9",
                    color: darkMode ? "#F8FAFC" : "#111827",
                    fontFamily: "Inter",
                  }}
                >
                  <option value="Plan to Watch">📌 Plan to Watch</option>
                  <option value="Watching">▶️ Watching</option>
                  <option value="Watched">✅ Watched</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}