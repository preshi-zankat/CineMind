import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MoviePage from "./pages/MoviePage";
import ComingSoon from "./pages/ComingSoon";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

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
          <Route path="/movies" element={<ComingSoon title="Movies" />} />
          <Route path="/tv" element={<ComingSoon title="TV Shows" />} />
          <Route path="/my-list" element={<ComingSoon title="My List" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
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