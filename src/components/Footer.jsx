import { Film } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

import { FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const { darkMode } = useTheme();

  return (
    <footer
      className="mt-24 border-t"
      style={{
        borderColor: darkMode ? "#1E293B" : "#E5E7EB",
        background: darkMode ? "#0B1120" : "#F1F5F9",
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Film size={20} style={{ color: "#7C3AED" }} />
            <h2
              className="text-xl font-bold"
              style={{ color: "#7C3AED", fontFamily: "Poppins" }}
            >
              CineMind
            </h2>
          </div>
          <p className="text-sm opacity-70" style={{ fontFamily: "Inter" }}>
            AI powered movie recommendations tailored to your mood and taste.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-3">Explore</h3>
          <ul className="space-y-2 text-sm opacity-80" style={{ fontFamily: "Inter" }}>
            <li><a href="#" className="hover:opacity-60">Trending</a></li>
            <li><a href="#" className="hover:opacity-60">Top Rated</a></li>
            <li><a href="#" className="hover:opacity-60">Genres</a></li>
            <li><a href="#" className="hover:opacity-60">New Releases</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-sm opacity-80" style={{ fontFamily: "Inter" }}>
            <li><a href="#" className="hover:opacity-60">About</a></li>
            <li><a href="#" className="hover:opacity-60">Careers</a></li>
            <li><a href="#" className="hover:opacity-60">Contact</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="font-semibold mb-3">Follow us</h3>
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-full transition hover:scale-110" style={{ background: darkMode ? "#111827" : "#E5E7EB" }}>
              <FaInstagram size={20} />
            </a>
            <a href="#" className="p-2 rounded-full transition hover:scale-110" style={{ background: darkMode ? "#111827" : "#E5E7EB" }}>
              <FaTwitter size={20} />
            </a>
            <a href="#" className="p-2 rounded-full transition hover:scale-110" style={{ background: darkMode ? "#111827" : "#E5E7EB" }}>
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>

      <div
        className="text-center text-sm opacity-60 py-6 border-t"
        style={{ borderColor: darkMode ? "#1E293B" : "#E5E7EB", fontFamily: "Inter" }}
      >
        © {new Date().getFullYear()} CineMind. All rights reserved.
      </div>
    </footer>
  );
}