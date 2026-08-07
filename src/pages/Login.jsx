import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { login } from "../appwrite/auth";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { darkMode, bg, color } = useTheme();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      toast.success("Login successful!");
      //refresh the page to fetch user data and redirect to home
      window.location.reload();
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong, please try again.");
      toast.error(err.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBg = darkMode ? "#111827" : "#ffffff";
  const inputTextClass = darkMode
    ? "text-white placeholder:text-gray-400"
    : "text-gray-900 placeholder:text-gray-500";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 transition-all duration-300"
      style={{ background: bg, color }}
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl p-10"
        style={{ background: darkMode ? "#0B1120" : "#F1F5F9" }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Film size={26} style={{ color: "#7C3AED" }} />
          <h1
            className="text-2xl font-bold"
            style={{ color: "#7C3AED", fontFamily: "Poppins, sans-serif" }}
          >
            CineMind
          </h1>
        </Link>

        <h2
          className="text-2xl font-extrabold text-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Welcome back
        </h2>
        <p
          className="text-center mt-2 opacity-70 text-sm"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Log in to continue to your recommendations
        </p>

        {error && (
          <div
            className="mt-5 px-4 py-3 rounded-xl text-sm"
            style={{ background: "#EF444420", color: "#EF4444", fontFamily: "Inter, sans-serif" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div
            className="flex items-center gap-3 rounded-full px-5 py-3.5 shadow-sm"
            style={{ background: inputBg }}
          >
            <Mail size={18} className="opacity-50 shrink-0" />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange("email")}
              required
              className={`flex-1 bg-transparent outline-none text-sm ${inputTextClass}`}
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Password */}
          <div
            className="flex items-center gap-3 rounded-full px-5 py-3.5 shadow-sm"
            style={{ background: inputBg }}
          >
            <Lock size={18} className="opacity-50 shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange("password")}
              required
              className={`flex-1 bg-transparent outline-none text-sm ${inputTextClass}`}
              style={{ fontFamily: "Inter, sans-serif" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="opacity-50 hover:opacity-80 transition shrink-0"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs opacity-70 hover:opacity-100 transition"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-semibold transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "#7C3AED", color: "white", fontFamily: "Inter, sans-serif" }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p
          className="text-center mt-6 text-sm opacity-70"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#7C3AED", fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}