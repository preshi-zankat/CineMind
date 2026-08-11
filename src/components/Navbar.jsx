import { Moon, Sun, Film, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { logout } from "../appwrite/auth";
import { getProfileImageUrl } from "../appwrite/storage";
import toast from "react-hot-toast";

export default function Navbar() {
  const { darkMode, toggleDarkMode, color } = useTheme();
  const { user, checkUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", to: "/" },
    { label: "Movies", to: "/movies" },
    { label: "TV Shows", to: "/tv" },
    { label: "Suggest", to: "/suggest" },
    { label: "My List", to: "/my-list" },
  ];

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#7C3AED" : color,
    fontWeight: isActive ? 700 : 500,
  });

  const profileImageUrl = user ? getProfileImageUrl(user.prefs?.profileImageId) : null;

  const handleLogout = async () => {
    try {
      await logout();
      await checkUser();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout.");
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md transition-all duration-300"
      style={{
        background: darkMode ? "#0F172ACC" : "#F8FAFCCC",
        borderBottom: darkMode ? "1px solid #1E293B" : "1px solid #E5E7EB",
        color,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <Film size={22} className="sm:hidden" style={{ color: "#7C3AED" }} />
          <Film size={24} className="hidden sm:block" style={{ color: "#7C3AED" }} />
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "#7C3AED", fontFamily: "Poppins, sans-serif" }}
          >
            CineMind
          </h1>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="transition hover:opacity-70"
              style={linkStyle}
              // fontFamily style prop se overwrite ho raha tha, isliye inline se hata ke yaha daala
            >
              <span style={{ fontFamily: "Inter, sans-serif" }}>{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleDarkMode}
            title="Toggle theme"
            className="p-2 rounded-full transition hover:scale-110"
            style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profile + Logout - desktop only, collapses into mobile menu below md */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/profile"
                title="My Profile"
                className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm transition hover:scale-110 flex items-center justify-center"
                style={{ background: darkMode ? "#111827" : "#E5E7EB" }}
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#7C3AED", fontFamily: "Poppins, sans-serif" }}
                  >
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </NavLink>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-full transition hover:scale-110"
                style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            // Logged out -> Login + Signup buttons (desktop only)
            <div className="hidden md:flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold transition hover:opacity-70"
                style={{ color, fontFamily: "Inter, sans-serif" }}
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-full text-sm font-semibold transition hover:scale-105"
                style={{ background: "#7C3AED", color: "white", fontFamily: "Inter, sans-serif" }}
              >
                Sign Up
              </NavLink>
            </div>
          )}

          {/* Mobile menu toggle - profile, logout, login/signup all collapse in here below md */}
          <button
            className="md:hidden p-2 rounded-full transition hover:scale-110"
            style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown - profile, logout, login/signup all live here below md */}
      {mobileOpen && (
        <div
          className="md:hidden flex flex-col gap-4 px-4 sm:px-6 pb-6 text-base"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={linkStyle}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {user && (
            <div
              className="flex items-center justify-between gap-3 pt-3 mt-1"
              style={{ borderTop: darkMode ? "1px solid #1E293B" : "1px solid #E5E7EB" }}
            >
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 min-w-0"
                style={linkStyle}
              >
                <span
                  className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                  style={{ background: darkMode ? "#111827" : "#E5E7EB" }}
                >
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </span>
                <span className="truncate">My Profile</span>
              </NavLink>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                title="Logout"
                className="p-2 rounded-full transition hover:scale-110 shrink-0"
                style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}

          {!user && (
            <div
              className="flex items-center gap-3 pt-3 mt-1"
              style={{ borderTop: darkMode ? "1px solid #1E293B" : "1px solid #E5E7EB" }}
            >
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-semibold"
                style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-semibold"
                style={{ background: "#7C3AED", color: "white" }}
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}