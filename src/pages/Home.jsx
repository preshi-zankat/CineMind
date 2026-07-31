import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import TrendingMovies from "../components/TrendingMovies";
import Footer from "../components/Footer";
import { searchMovies, getImageUrl } from "../lib/tmdb";

export default function Home() {
  const navigate = useNavigate();
  const { darkMode, bg, color } = useTheme();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchBoxRef = useRef(null);

  // Typing rukne ke 400ms baad hi search chalega (debounce), taaki har keystroke pe API call na ho
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchMovies(query.trim());
        setSuggestions(data.results?.slice(0, 5) || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Dropdown ke bahar click hone pe band ho jaye
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToMovie = (movie) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/movie/${movie.id}`);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Agar suggestions already load ho chuki hai to seedha pehli movie pe le jao
    if (suggestions.length > 0) {
      goToMovie(suggestions[0]);
      return;
    }

    // Warna turant search karke pehla result nikalo
    try {
      const data = await searchMovies(query.trim());
      if (data.results?.length > 0) {
        goToMovie(data.results[0]);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{ background: bg, color }}
    >
     

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-18 text-center">
        <span
          className="px-5 py-2 rounded-full font-semibold"
          style={{
            background: "#7C3AED20",
            color: "#7C3AED",
          }}
        >
          AI Powered Recommendations
        </span>

        <h1
          className="mt-8 text-5xl md:text-6xl font-extrabold leading-tight"
          style={{ fontFamily: "Poppins" }}
        >
          Discover Your
          <br />
          <span style={{ color: "#7C3AED" }}>Next Favorite Movie</span>
        </h1>

        <p
          className="mt-6 max-w-2xl mx-auto text-lg opacity-80"
          style={{ fontFamily: "Inter" }}
        >
          Get personalized movie recommendations based on your mood, favorite
          genres, actors and watch history.
        </p>

        {/* Search */}
        <div className="mt-12 max-w-xl mx-auto relative" ref={searchBoxRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="rounded-full flex overflow-hidden shadow-xl"
            style={{
              background: darkMode ? "#111827" : "#ffffff",
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search movies..."
              className={`flex-1 bg-transparent px-6 py-4 outline-none ${
                darkMode
                  ? "text-white placeholder:text-gray-400"
                  : "text-gray-900 placeholder:text-gray-500"
              }`}
            />

            <button
              type="submit"
              className="px-6"
              style={{
                background: "#7C3AED",
                color: "white",
              }}
            >
              <Search />
            </button>
          </form>

          {/* Live suggestions dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div
              className="absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-40 text-left"
              style={{ background: darkMode ? "#111827" : "#ffffff" }}
            >
              {suggestions.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => goToMovie(movie)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition hover:opacity-80"
                  style={{ borderBottom: darkMode ? "1px solid #1E293B" : "1px solid #E5E7EB" }}
                >
                  <img
                    src={getImageUrl(movie.poster_path, "w92")}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded-md shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ fontFamily: "Poppins" }}>
                      {movie.title}
                    </p>
                    <p className="text-xs opacity-60" style={{ fontFamily: "Inter" }}>
                      {movie.release_date?.slice(0, 4) || "—"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-10 flex justify-center gap-5">
          <button
            className="px-8 py-3 rounded-full font-semibold transition hover:scale-105"
            style={{
              background: "#7C3AED",
              color: "white",
            }}
          >
            Explore Movies
          </button>

          <button
            className="px-8 py-3 rounded-full font-semibold transition hover:scale-105"
            style={{
              background: "#F59E0B",
              color: "#111827",
            }}
          >
            Trending Now
          </button>
        </div>
      </section>

      {/* Trending movies grid - animated, clickable cards */}
      <TrendingMovies onSelect={(movie) => navigate(`/movie/${movie.id}`)} />

      
    </div>
  );
}