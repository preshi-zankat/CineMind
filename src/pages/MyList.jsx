import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Play, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getFavorites } from "../appwrite/favorites";
import { removeFavorite } from "../appwrite/favorites";
import { getImageUrl } from "../lib/tmdb";
import toast from "react-hot-toast";

export default function MyList() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadFavorites() {
      try {
        const data = await getFavorites(user.$id);
        setFavorites(data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load favorites. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [user]);

  const handleRemove = async (rowId) => {
    try {
      await removeFavorite(rowId);

      setFavorites((prev) => prev.filter((movie) => movie.$id !== rowId));
      toast.success("Movie removed from favorites.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove movie from favorites.");
    }
  };

  const handleClick = (movie) => {
    // NOTE: favorite document ka Appwrite $id TMDB movie id nahi hai.
    // Isliye movieId (ya id) field use kar rahe hai - apne favorites schema ke hisaab se field name confirm kar le.
    const movieId = movie.movieId || movie.id;
    if (movieId) navigate(`/movie/${movieId}`);
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

      <h1
        className="text-3xl font-extrabold mb-8"
        style={{ fontFamily: "Poppins" }}
      >
        ❤️ My Favorites
      </h1>

      {favorites.length === 0 ? (
        <h2 className="opacity-70" style={{ fontFamily: "Inter" }}>
          You haven't added any favorite movies yet.
        </h2>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {favorites.map((movie, index) => (
            <button
              key={movie.$id}
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
                  src={getImageUrl(movie.poster)}
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
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    {movie.rating?.toFixed(1)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Card click nahi hoga
                      handleRemove(movie.$id);
                    }}
                    className="transition-transform hover:scale-110"
                  >
                    <Heart size={16} fill="#EF4444" color="#EF4444" />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
