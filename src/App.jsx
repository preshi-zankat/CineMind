import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MoviePage from "./pages/MoviePage";
import ComingSoon from "./pages/ComingSoon";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyList from "./pages/MyList";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Moviesearch from "./pages/Moviesearch";
import Trending from "./pages/Trending";

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
          <Route path="/movies" element={<Moviesearch />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/tv" element={<ComingSoon title="TV Shows" />} />
          <Route
            path="/my-list"
            element={
              <ProtectedRoute>
                <MyList />
              </ProtectedRoute>
            }
          />
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
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
