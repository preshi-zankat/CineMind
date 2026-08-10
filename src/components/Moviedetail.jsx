import { Star, Clock, Calendar, Play, ArrowLeft, Heart, Bookmark } from "lucide-react";
import { getImageUrl } from "../lib/tmdb";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { addFavorite, removeFavorite, isFavorite } from "../appwrite/favorites";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "../appwrite/watchlist";
import {
  addReview,
  getContentReviews,
  updateReview,
  deleteReview,
} from "../appwrite/reviews";
import StarRating from "./StarRating";

export default function MovieDetail({ movie, onBack }) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  if (!movie) return null;

  const { user } = useAuth();

  const [favorite, setFavorite] = useState(null);
  const [watchlistItem, setWatchlistItem] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!user || !movie) return;

    async function checkFavorite() {
      const fav = await isFavorite(movie.id, user.$id, "movie");
      setFavorite(fav);
    }

    async function checkWatchlist() {
      const item = await isInWatchlist(movie.id, user.$id, "movie");
      setWatchlistItem(item);
    }

    checkFavorite();
    checkWatchlist();
  }, [movie, user]);

  useEffect(() => {
    if (!movie) return;

    async function loadReviews() {
      setLoadingReviews(true);
      try {
        const allReviews = await getContentReviews(movie.id, "movie");
        setReviews(allReviews);

        if (user) {
          const mine = allReviews.find((r) => r.userId === user.$id) || null;
          setMyReview(mine);
          if (mine) {
            setRatingInput(mine.rating);
            setReviewText(mine.review);
          } else {
            setRatingInput(0);
            setReviewText("");
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    }

    loadReviews();
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
        const newFavorite = await addFavorite(movie, user.$id, "movie");
        setFavorite(newFavorite);
        toast.success("Movie added to favorites.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorite status.");
    }
  };

  const handleWatchlist = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      if (watchlistItem) {
        await removeFromWatchlist(watchlistItem.$id);
        setWatchlistItem(null);
        toast.success("Removed from watchlist.");
      } else {
        const newItem = await addToWatchlist(movie, user.$id, "movie");
        setWatchlistItem(newItem);
        toast.success("Movie added to watchlist.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update watchlist.");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (ratingInput === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review.");
      return;
    }

    setSubmittingReview(true);
    try {
      if (myReview) {
        const updated = await updateReview(myReview.$id, {
          rating: ratingInput,
          reviewText: reviewText.trim(),
        });
        setReviews((prev) => prev.map((r) => (r.$id === updated.$id ? updated : r)));
        setMyReview(updated);
        toast.success("Review updated.");
      } else {
        const newReview = await addReview({
          contentId: movie.id,
          contentType: "movie",
          userId: user.$id,
          userName: user.name,
          rating: ratingInput,
          reviewText: reviewText.trim(),
        });
        setReviews((prev) => [newReview, ...prev]);
        setMyReview(newReview);
        toast.success("Review submitted.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    try {
      await deleteReview(myReview.$id);
      setReviews((prev) => prev.filter((r) => r.$id !== myReview.$id));
      setMyReview(null);
      setRatingInput(0);
      setReviewText("");
      toast.success("Review deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting review.");
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

  const avgUserRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

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
          <div className="mt-7 flex flex-wrap gap-4">
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

            <button
              onClick={handleWatchlist}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold border transition-all duration-200 hover:scale-105"
              style={{
                background: watchlistItem
                  ? "#7C3AED20"
                  : darkMode
                  ? "#1F2937"
                  : "#FFFFFF",
                color: watchlistItem
                  ? "#7C3AED"
                  : darkMode
                  ? "#FFFFFF"
                  : "#111827",
                border: watchlistItem ? "1px solid #7C3AED" : "1px solid #D1D5DB",
              }}
            >
              <Bookmark
                size={18}
                fill={watchlistItem ? "#7C3AED" : "none"}
                color={watchlistItem ? "#7C3AED" : darkMode ? "#FFFFFF" : "#111827"}
              />
              {watchlistItem ? "In Watchlist" : "Add to Watchlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings */}
      <div className="max-w-7xl mx-auto px-8 mt-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Poppins" }}>
            Ratings & Reviews
          </h2>
          {avgUserRating && (
            <span
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: "#F59E0B20", color: "#F59E0B" }}
            >
              <Star size={14} fill="#F59E0B" color="#F59E0B" />
              {avgUserRating} ({reviews.length} review{reviews.length > 1 ? "s" : ""})
            </span>
          )}
        </div>

        {/* Write / edit review */}
        {user ? (
          <div
            className="rounded-2xl p-5 mb-8"
            style={{ background: darkMode ? "#0B1120" : "#F1F5F9" }}
          >
            <p className="text-sm font-semibold mb-2 opacity-70" style={{ fontFamily: "Inter" }}>
              {myReview ? "Edit your review" : "Rate and review this movie"}
            </p>
            <StarRating value={ratingInput} onChange={setRatingInput} size={26} />

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              rows={3}
              className={`mt-4 w-full px-4 py-3 rounded-xl outline-none resize-none ${
                darkMode ? "text-white placeholder:text-gray-400" : "text-gray-900 placeholder:text-gray-500"
              }`}
              style={{ background: darkMode ? "#111827" : "#ffffff", fontFamily: "Inter" }}
            />

            <div className="flex gap-3 mt-3">
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-full font-semibold transition hover:scale-105 disabled:opacity-60"
                style={{ background: "#7C3AED", color: "white", fontFamily: "Inter" }}
              >
                {submittingReview ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
              </button>
              {myReview && (
                <button
                  onClick={handleDeleteReview}
                  className="px-6 py-2.5 rounded-full font-semibold transition hover:scale-105"
                  style={{
                    background: darkMode ? "#1F2937" : "#ffffff",
                    color: "#EF4444",
                    border: "1px solid #EF444440",
                    fontFamily: "Inter",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <p
            className="mb-8 text-sm opacity-70"
            style={{ fontFamily: "Inter" }}
          >
            Give ratings and reviews.{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </p>
        )}

        {/* All reviews list */}
        {loadingReviews ? (
          <p className="opacity-60 text-sm" style={{ fontFamily: "Inter" }}>
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p className="opacity-60 text-sm" style={{ fontFamily: "Inter" }}>
            No reviews yet. Be the first to review this movie!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.$id}
                className="rounded-2xl p-5"
                style={{ background: darkMode ? "#111827" : "#ffffff" }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold" style={{ fontFamily: "Poppins" }}>
                    {r.userName || "CineMind User"}
                    {user && r.userId === user.$id && (
                      <span className="ml-1.5 text-xs font-normal opacity-60">(You)</span>
                    )}
                  </p>
                  <StarRating value={r.rating} readOnly size={16} />
                </div>
                {r.review && (
                  <p
                    className="mt-2 text-sm opacity-85 leading-relaxed"
                    style={{ fontFamily: "Inter" }}
                  >
                    {r.review}
                  </p>
                )}
                <p className="mt-2 text-xs opacity-50" style={{ fontFamily: "Inter" }}>
                  {new Date(r.$createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
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