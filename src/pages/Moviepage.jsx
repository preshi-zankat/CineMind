import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieDetail from "../components/MovieDetail";
import { getMovieDetails } from "../lib/tmdb";
import toast from "react-hot-toast";

export default function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bg, color } = useTheme();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchMovie() {
      setLoading(true);
      setError(false);
      try {
        const data = await getMovieDetails(id);
        if (!cancelled) setMovie(data);
      } catch (err) {
        console.error("Failed to load movie:", err);
        toast.error("Failed to load movie details.");
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMovie();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bg, color }}
      >
        <p style={{ fontFamily: "Inter" }}>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: bg, color }}
      >
        <p style={{ fontFamily: "Inter" }}>
          {error
            ? "Failed to load movie details. Please try again later."
            : "Movie not found."
            
            }
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 rounded-full font-semibold"
          style={{ background: "#7C3AED", color: "white" }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-300" style={{ background: bg, color }}>
      
      <MovieDetail movie={movie} onBack={() => navigate(-1)} />
     
    </div>
  );
}