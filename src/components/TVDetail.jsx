import { Star, Calendar, Play, ArrowLeft, Tv2 } from "lucide-react";
import { getImageUrl } from "../lib/tmdb";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function TVDetail({ show, onBack }) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  if (!show) return null;

  const trailer = show.videos?.results?.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );
  const cast = show.credits?.cast?.slice(0, 8) || [];
  const creators = show.created_by || [];
  const similarShows = show.similar?.results?.slice(0, 10) || [];

  const providersByRegion = show["watch/providers"]?.results || {};
  const regionData =
    providersByRegion.IN || providersByRegion.US || Object.values(providersByRegion)[0];
  const allProviders = regionData
    ? [...(regionData.flatrate || []), ...(regionData.rent || []), ...(regionData.buy || [])]
    : [];
  const uniqueProviders = Array.from(
    new Map(allProviders.map((p) => [p.provider_id, p])).values()
  );

  return (
    <div>
      {/* Backdrop hero */}
      <div className="relative w-full" style={{ height: "60vh", minHeight: 380 }}>
        <img
          src={getImageUrl(show.backdrop_path, "original")}
          alt={show.name}
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
        <img
          src={getImageUrl(show.poster_path, "w500")}
          alt={show.name}
          className="w-48 md:w-64 aspect-[2/3] object-cover rounded-2xl shadow-2xl shrink-0"
        />

        <div className="pt-4 md:pt-24">
          <h1 className="text-3xl md:text-5xl font-extrabold" style={{ fontFamily: "Poppins" }}>
            {show.name}
          </h1>
          {show.tagline && (
            <p className="mt-2 opacity-70 italic" style={{ fontFamily: "Inter" }}>
              {show.tagline}
            </p>
          )}

          <div
            className="mt-5 flex flex-wrap items-center gap-5 text-sm opacity-90"
            style={{ fontFamily: "Inter" }}
          >
            <span className="flex items-center gap-1 font-semibold">
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              {show.vote_average?.toFixed(1)} / 10
            </span>
            <span className="flex items-center gap-1">
              <Tv2 size={16} />
              {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""} ·{" "}
              {show.number_of_episodes} Episodes
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {show.first_air_date?.slice(0, 4)}
              {show.status === "Ended" ? ` – ${show.last_air_date?.slice(0, 4)}` : " – Present"}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {show.genres?.map((g) => (
              <span
                key={g.id}
                className="px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ background: "#7C3AED20", color: "#7C3AED" }}
              >
                {g.name}
              </span>
            ))}
          </div>

          {creators.length > 0 && (
            <p className="mt-5 text-sm opacity-90" style={{ fontFamily: "Inter" }}>
              <span className="font-semibold opacity-70">Created by: </span>
              {creators.map((c) => c.name).join(", ")}
            </p>
          )}

          <p className="mt-6 max-w-2xl leading-relaxed opacity-85" style={{ fontFamily: "Inter" }}>
            {show.overview}
          </p>

          {uniqueProviders.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold opacity-70 mb-3" style={{ fontFamily: "Inter" }}>
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
            </div>
          )}

          {trailer && (
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold"
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

      {/* Similar shows */}
      {similarShows.length > 0 && (
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

          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Poppins" }}>
            You May Also Like
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {similarShows.map((s, index) => (
              <button
                key={s.id}
                onClick={() => navigate(`/tv/${s.id}`)}
                className="similar-card text-left rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 focus:outline-none focus:ring-2"
                style={{
                  background: darkMode ? "#111827" : "#ffffff",
                  animationDelay: `${(index % 10) * 0.06}s`,
                  ringColor: "#7C3AED",
                }}
              >
                <div className="relative overflow-hidden aspect-[2/3]">
                  <img
                    src={getImageUrl(s.poster_path, "w342")}
                    alt={s.name}
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
                    {s.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70" style={{ fontFamily: "Inter" }}>
                      {s.first_air_date?.slice(0, 4) || "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      {s.vote_average?.toFixed(1)}
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