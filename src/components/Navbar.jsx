import { Moon, Sun, Film, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { logout } from "../appwrite/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function Navbar() {
  const { darkMode, toggleDarkMode, color } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", to: "/" },
    { label: "Movies", to: "/movies" },
    { label: "TV Shows", to: "/tv" },
    { label: "My List", to: "/my-list" },
  ];

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#7C3AED" : color,
    fontWeight: isActive ? 700 : 500,
  });

  const { checkUser } = useAuth();
const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <Film size={24} style={{ color: "#7C3AED" }} />
          <h1
            className="text-2xl font-bold"
            style={{ color: "#7C3AED", fontFamily: "Poppins, sans-serif" }}
          >
            CineMind
          </h1>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
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

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition hover:scale-110"
            style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full transition hover:scale-110"
            style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
          >
            <span style={{ fontFamily: "Inter, sans-serif" }}>Logout</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-full transition hover:scale-110"
            style={{ background: darkMode ? "#111827" : "#E5E7EB", color }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden flex flex-col gap-4 px-8 pb-6"
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
        </div>
      )}
    </nav>
  );
}