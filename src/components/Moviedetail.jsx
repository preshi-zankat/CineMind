import { Star, Clock, Calendar, Play, ArrowLeft } from "lucide-react";
import { getImageUrl } from "../lib/tmdb";
import { useTheme } from "../context/ThemeContext";

export default function MovieDetail({ movie, onBack }) {
  const { darkMode } = useTheme();

  if (!movie) return null;

  const trailer = movie.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const runtimeHrs = Math.floor((movie.runtime || 0) / 60);
  const runtimeMins = (movie.runtime || 0) % 60;

  return (
    <div>
      {/* Backdrop hero */}
      <div className="relative w-full" style={{ height: "60vh", minHeight: 380 }}>
        <img
          src={getImageUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? "linear-gradient(180deg, #0F172A00 0%, #0F172A 95%)"
              : "linear-gradient(180deg, #F8FAFC00 0%, #F8FAFC 95%)",
          }}
        />

        <button
          onClick={onBack}
          className="absolute top-6 left-8 flex items-center gap-2 px-4 py-2 rounded-full font-medium backdrop-blur-md transition hover:scale-105"
          style={{ background: "#00000066", color: "white" }}
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 -mt-40 relative flex flex-col md:flex-row gap-10">
        {/* Poster */}
        <img
          src={getImageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          className="w-48 md:w-64 rounded-2xl shadow-2xl shrink-0"
        />

        {/* Info */}
        <div className="pt-4 md:pt-24">
          <h1
            className="text-3xl md:text-5xl font-extrabold"
            style={{ fontFamily: "Poppins" }}
          >
            {movie.title}
          </h1>
          {movie.tagline && (
            <p className="mt-2 opacity-70 italic" style={{ fontFamily: "Inter" }}>
              {movie.tagline}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm opacity-90" style={{ fontFamily: "Inter" }}>
            <span className="flex items-center gap-1 font-semibold">
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              {movie.vote_average?.toFixed(1)} / 10
            </span>
            {movie.runtime > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {runtimeHrs}h {runtimeMins}m
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {movie.release_date?.slice(0, 4)}
            </span>
          </div>

          {/* Genres */}
          <div className="mt-5 flex flex-wrap gap-2">
            {movie.genres?.map((g) => (
              <span
                key={g.id}
                className="px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ background: "#7C3AED20", color: "#7C3AED" }}
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p
            className="mt-6 max-w-2xl leading-relaxed opacity-85"
            style={{ fontFamily: "Inter" }}
          >
            {movie.overview}
          </p>

          {/* Trailer button */}
          {trailer && (
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold transition hover:scale-105"
              style={{ background: "#7C3AED", color: "white" }}
            >
              <Play size={18} fill="white" />
              Watch Trailer
            </a>
          )}
        </div>
      </div>

      {/* Cast */}
      {cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 mt-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Poppins" }}>
            Cast
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-4">
            {cast.map((person) => (
              <div key={person.id} className="w-32 shrink-0 text-center">
                <img
                  src={getImageUrl(person.profile_path, "w200")}
                  alt={person.name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
                <p className="mt-2 text-sm font-semibold truncate">{person.name}</p>
                <p className="text-xs opacity-60 truncate">{person.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}