import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import MoviePage from "./pages/MoviePage";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/movies" element={<ComingSoon title="Movies" />} />
          <Route path="/tv" element={<ComingSoon title="TV Shows" />} />
          <Route path="/my-list" element={<ComingSoon title="My List" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}