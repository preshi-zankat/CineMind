import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Pencil, Check, X, Star, Play, Heart, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getImageUrl } from "../lib/tmdb";
import { getFavorites } from "../appwrite/favorites";
import { getWatchlist } from "../appwrite/watchlist";
import { updateUserName, updateUserPrefs } from "../appwrite/profile";
import { uploadProfileImage, getProfileImageUrl, deleteProfileImage } from "../appwrite/storage";

export default function Profile() {
  const { user, checkUser } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setNameInput(user.name || "");

    async function loadData() {
      try {
        const [favData, watchData] = await Promise.all([
          getFavorites(user.$id),
          getWatchlist(user.$id),
        ]);
        setFavorites(favData);
        setWatchlist(watchData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p style={{ fontFamily: "Inter" }}>Profile dekhne ke liye login kar.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 rounded-full font-semibold"
          style={{ background: "#7C3AED", color: "white" }}
        >
          Log In
        </button>
      </div>
    );
  }

  const profileImageUrl = getProfileImageUrl(user.prefs?.profileImageId);

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      toast.error("Name khaali nahi ho sakta.");
      return;
    }
    setSavingName(true);
    try {
      await updateUserName(nameInput.trim());
      await checkUser();
      toast.success("Name updated.");
      setEditingName(false);
    } catch (err) {
      console.error(err);
      toast.error("Name update nahi hua.");
    } finally {
      setSavingName(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploaded = await uploadProfileImage(file);

      // Purani image thi to hata do (storage clean rakhne ke liye)
      const oldFileId = user.prefs?.profileImageId;
      await updateUserPrefs({ profileImageId: uploaded.$id });
      if (oldFileId) {
        deleteProfileImage(oldFileId).catch(() => {});
      }

      await checkUser();
      toast.success("Profile picture updated.");
    } catch (err) {
      console.error(err);
      toast.error("Image upload nahi hui.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const cardBg = darkMode ? "#111827" : "#ffffff";

  const renderRow = (title, icon, items, viewAllPath, emptyText) => (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl font-bold flex items-center gap-2"
          style={{ fontFamily: "Poppins" }}
        >
          {icon}
          {title}
        </h2>
        {items.length > 0 && (
          <button
            onClick={() => navigate(viewAllPath)}
            className="text-sm font-semibold hover:opacity-70 transition"
            style={{ color: "#7C3AED", fontFamily: "Inter" }}
          >
            View all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="opacity-60 text-sm" style={{ fontFamily: "Inter" }}>
          {emptyText}
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {items.slice(0, 8).map((movie) => (
            <button
              key={movie.$id}
              onClick={() => navigate(`/movie/${movie.movieId}`)}
              className="w-32 shrink-0 text-left rounded-xl overflow-hidden shadow-md transition-transform hover:-translate-y-1"
              style={{ background: cardBg }}
            >
              <div className="relative aspect-[2/3]">
                <img
                  src={getImageUrl(movie.poster)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold truncate" style={{ fontFamily: "Poppins" }}>
                  {movie.title}
                </p>
                <span className="flex items-center gap-1 text-[11px] opacity-70 mt-0.5">
                  <Star size={10} fill="#F59E0B" color="#F59E0B" />
                  {movie.rating?.toFixed ? movie.rating.toFixed(1) : movie.rating}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-28 h-28 rounded-full overflow-hidden shadow-lg flex items-center justify-center"
            style={{ background: darkMode ? "#111827" : "#E5E7EB" }}
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span
                className="text-3xl font-bold"
                style={{ color: "#7C3AED", fontFamily: "Poppins" }}
              >
                {user.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition hover:scale-110 disabled:opacity-60"
            style={{ background: "#7C3AED" }}
            title="Change profile picture"
          >
            <Camera size={16} color="white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Name + email */}
        <div className="text-center sm:text-left flex-1">
          {editingName ? (
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                className="px-4 py-2 rounded-full text-lg font-bold outline-none"
                style={{
                  background: darkMode ? "#111827" : "#F1F5F9",
                  color: darkMode ? "#F8FAFC" : "#111827",
                  fontFamily: "Poppins",
                }}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="p-2 rounded-full transition hover:scale-110"
                style={{ background: "#7C3AED" }}
              >
                <Check size={16} color="white" />
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameInput(user.name || "");
                }}
                className="p-2 rounded-full transition hover:scale-110"
                style={{ background: darkMode ? "#1F2937" : "#E5E7EB" }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-extrabold" style={{ fontFamily: "Poppins" }}>
                {user.name}
              </h1>
              <button
                onClick={() => setEditingName(true)}
                className="p-1.5 rounded-full transition hover:scale-110"
                style={{ background: darkMode ? "#1F2937" : "#E5E7EB" }}
                title="Edit name"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}

          <p className="mt-1 opacity-70 text-sm" style={{ fontFamily: "Inter" }}>
            {user.email}
          </p>

          <div className="flex gap-6 mt-4 justify-center sm:justify-start text-sm">
            <span style={{ fontFamily: "Inter" }}>
              <strong>{favorites.length}</strong> Favorites
            </span>
            <span style={{ fontFamily: "Inter" }}>
              <strong>{watchlist.length}</strong> Watchlist
            </span>
          </div>
        </div>
      </div>

      {!loading && (
        <>
          {renderRow(
            "Favorites",
            <Heart size={20} fill="#EF4444" color="#EF4444" />,
            favorites,
            "/my-list",
            "Abhi koi favorite movie nahi hai."
          )}
          {renderRow(
            "Watchlist",
            <Bookmark size={20} fill="#7C3AED" color="#7C3AED" />,
            watchlist,
            "/watchlist",
            "Abhi watchlist khaali hai."
          )}
        </>
      )}
    </div>
  );
}