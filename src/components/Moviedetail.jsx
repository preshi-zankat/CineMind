import { Star, Clock, Calendar, Play, ArrowLeft, Heart } from "lucide-react";
import { getImageUrl } from "../lib/tmdb";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { addFavorite, removeFavorite, isFavorite } from "../appwrite/favorites";

export default function MovieDetail({ movie, onBack }) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  if (!movie) return null;

  const { user } = useAuth();

  const [favorite, setFavorite] = useState(null);

  useEffect(() => {
    if (!user || !movie) return;

    async function checkFavorite() {
      const fav = await isFavorite(movie.id, user.$id);
      setFavorite(fav);
    }

    checkFavorite();
  }, [movie, user]);

  const handleFavorite = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      if (favorite) {
        await removeFavorite(favorite.$id);
        setFavorite(null);
      } else {
        const newFavorite = await addFavorite(movie, user.$id);
        setFavorite(newFavorite);
        toast.success("Movie added to favorites.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorite status.");
    }
  };

  const trailer = movie.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube",
  );
  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const runtimeHrs = Math.floor((movie.runtime || 0) / 60);
  const runtimeMins = (movie.runtime || 0) % 60;

  // Director + Producer(s) crew se nikaal rahe hai (already credits fetch ho raha hai)
  const crew = movie.credits?.crew || [];
  const director = crew.find((c) => c.job === "Director");
  const producers = crew.filter((c) => c.job === "Producer").slice(0, 3);
  const writer = crew.find((c) => c.job === "Screenplay" || c.job === "Writer");

  // OTT / streaming availability. TMDB region-wise data deta hai,
  // isliye India try karo, warna US, warna jo bhi pehla region mile
  const providersByRegion = movie["watch/providers"]?.results || {};
  const regionData =
    providersByRegion.IN || providersByRegion.US || Object.values(providersByRegion)[0];

  const allProviders = regionData
    ? [
        ...(regionData.flatrate || []),
        ...(regionData.rent || []),
        ...(regionData.buy || []),
      ]
    : [];

  // Duplicate providers hata do (agar ek hi platform flatrate + rent dono mein hai)
  const uniqueProviders = Array.from(
    new Map(allProviders.map((p) => [p.provider_id, p])).values()
  );

  const similarMovies = movie.similar?.results?.slice(0, 10) || [];

  return (
    <div>
      {/* Backdrop hero */}
      <div
        className="relative w-full"
        style={{ height: "60vh", minHeight: 380 }}
      >
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
      <div className="max-w-7xl mx-auto px-8 -mt-40 relative flex flex-col md:flex-row items-start gap-10">
        {/* Poster */}
        <img
          src={getImageUrl(movie.poster_path, "w500")}
          alt={movie.title}
          className="w-48 md:w-64 aspect-[2/3] object-cover rounded-2xl shadow-2xl shrink-0"
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
            <p
              className="mt-2 opacity-70 italic"
              style={{ fontFamily: "Inter" }}
            >
              {movie.tagline}
            </p>
          )}

          {/* Meta row */}
          <div
            className="mt-5 flex flex-wrap items-center gap-5 text-sm opacity-90"
            style={{ fontFamily: "Inter" }}
          >
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

          {/* Director / Writer / Producer */}
          {(director || writer || producers.length > 0) && (
            <div
              className="mt-5 flex flex-col gap-1.5 text-sm opacity-90"
              style={{ fontFamily: "Inter" }}
            >
              {director && (
                <p>
                  <span className="font-semibold opacity-70">Director: </span>
                  {director.name}
                </p>
              )}
              {writer && (
                <p>
                  <span className="font-semibold opacity-70">Writer: </span>
                  {writer.name}
                </p>
              )}
              {producers.length > 0 && (
                <p>
                  <span className="font-semibold opacity-70">
                    {producers.length > 1 ? "Producers: " : "Producer: "}
                  </span>
                  {producers.map((p) => p.name).join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Overview */}
          <p
            className="mt-6 max-w-2xl leading-relaxed opacity-85"
            style={{ fontFamily: "Inter" }}
          >
            {movie.overview}
          </p>

          {/* OTT / Streaming availability */}
          {uniqueProviders.length > 0 && (
            <div className="mt-6">
              <p
                className="text-sm font-semibold opacity-70 mb-3"
                style={{ fontFamily: "Inter" }}
              >
                Available on:
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {uniqueProviders.map((p) => (
                  <div
                    key={p.provider_id}
                    title={p.provider_name}
                    className="w-11 h-11 rounded-xl overflow-hidden shadow-md"
                  >
                    <img
                      src={getImageUrl(p.logo_path, "w92")}
                      alt={p.provider_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {regionData?.link && (
                <a
                  href={regionData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs opacity-60 hover:opacity-100 transition underline"
                  style={{ fontFamily: "Inter" }}
                >
                  Powered by JustWatch
                </a>
              )}
            </div>
          )}

          {/* Trailer button */}
          <div className="mt-7 flex gap-4">
            {trailer && (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold"
                style={{ background: "#7C3AED", color: "white" }}
              >
                <Play size={18} fill="white" />
                Watch Trailer
              </a>
            )}

            <button
              onClick={handleFavorite}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold border transition-all duration-200 hover:scale-105"
              style={{
                background: darkMode ? "#1F2937" : "#FFFFFF",
                color: darkMode ? "#FFFFFF" : "#111827",
                border: "1px solid #D1D5DB",
              }}
            >
              <Heart
                size={18}
                fill={favorite ? "#EF4444" : "none"}
                color={favorite ? "#EF4444" : darkMode ? "#FFFFFF" : "#111827"}
              />
              {favorite ? "Unfavorite" : "Favorite"}
            </button>
          </div>
        </div>
      </div>

      {/* Cast */}
      {cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 mt-16">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "Poppins" }}
          >
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
                <p className="mt-2 text-sm font-semibold truncate">
                  {person.name}
                </p>
                <p className="text-xs opacity-60 truncate">
                  {person.character}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 mt-16 mb-16">
          <style>{`
            @keyframes cardFadeUp {
              from { opacity: 0; transform: translateY(24px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .similar-card { animation: cardFadeUp 0.5s ease both; }
            .similar-card:hover .poster-img { transform: scale(1.08); }
            .similar-card:hover .play-overlay { opacity: 1; }
          `}</style>

          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "Poppins" }}
          >
            You May Also Like
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {similarMovies.map((m, index) => (
              <button
                key={m.id}
                onClick={() => navigate(`/movie/${m.id}`)}
                className="similar-card text-left rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 focus:outline-none focus:ring-2"
                style={{
                  background: darkMode ? "#111827" : "#ffffff",
                  animationDelay: `${(index % 10) * 0.06}s`,
                  ringColor: "#7C3AED",
                }}
              >
                <div className="relative overflow-hidden aspect-[2/3]">
                  <img
                    src={getImageUrl(m.poster_path, "w342")}
                    alt={m.title}
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
                    {m.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70" style={{ fontFamily: "Inter" }}>
                      {m.release_date?.slice(0, 4) || "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      {m.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}