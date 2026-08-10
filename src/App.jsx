import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MoviePage from "./pages/MoviePage";
import ComingSoon from "./pages/ComingSoon";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyList from "./pages/MyList";
import MovieSearch from "./pages/MovieSearch";
import Trending from "./pages/Trending";
import WatchList from "./pages/WatchList";
import Profile from "./pages/Profile";
import TVShows from "./pages/TVShows";
import TVPage from "./pages/TVPage";
import SuggestMovies from "./pages/SuggestMovies";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

// Navbar/Footer yaha se global mil rahe hai, isliye ye ThemeProvider ke andar
// hona chahiye taaki useTheme() kaam kare
function AppLayout() {
  const { bg, color } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-300"
      style={{ background: bg, color }}
    >
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/tv" element={<TVShows />} />
          <Route path="/suggest" element={<SuggestMovies />} />
          <Route path="/tv/:id" element={<TVPage />} />
          <Route path="/movies" element={<MovieSearch />} />
          <Route path="/trending" element={<Trending />} />

          {/* Public-only routes - agar already logged in hai to yaha nahi aa payega */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected routes - sirf logged-in user ke liye */}
          <Route
            path="/my-list"
            element={
              <ProtectedRoute>
                <MyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ThemeProvider>
  );
}