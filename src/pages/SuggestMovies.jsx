import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, Play, Send } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  discoverMovies,
  searchMovies,
  getMoviesByPerson,
  discoverTV,
  searchTV,
  getTVByPerson,
  searchPerson,
  getImageUrl,
} from "../lib/tmdb";
import { parsePrompt } from "../lib/promptSuggest";
import { getAIFilters } from "../lib/groq";

const EXAMPLE_PROMPTS = [
  "I want a feel-good comedy",
  "A good crime drama series",
  "Suggest a romantic Hindi movie",
  "Funny sitcom to binge watch",
];

export default function SuggestMovies() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState([]);
  const [resultType, setResultType] = useState("movie"); // jo actually detect hua tha last search mein
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [usedAI, setUsedAI] = useState(false);

  const handleSuggest = async (customPrompt) => {
    const finalPrompt = customPrompt ?? prompt;
    if (!finalPrompt.trim()) return;

    setPrompt(finalPrompt);
    setLoading(true);
    setSearched(true);
    setUsedAI(false);

    // Pehle Groq se try karo - ye khud decide karta hai movie ya TV show chahiye.
    // Agar wo fail ho jaaye (key missing, network issue, rate limit) to keyword-matching fallback.
    let filters;
    try {
      const aiResult = await getAIFilters(finalPrompt);
      filters = {
        mediaType: aiResult.mediaType === "tv" ? "tv" : "movie",
        genre: aiResult.genreIds?.length > 0 ? aiResult.genreIds.join("|") : null,
        minRating: aiResult.minRating || null,
        language: aiResult.language || null,
        personName: aiResult.personName || null,
        keywords: aiResult.keywords || null,
        matchedAnything: aiResult.genreIds?.length > 0 || aiResult.minRating || aiResult.language,
      };
      setUsedAI(true);
    } catch (err) {
      console.error("Groq suggestion failed, falling back to keyword match:", err);
      filters = parsePrompt(finalPrompt);
    }

    setResultType(filters.mediaType);

    try {
      let items = [];
      const isTV = filters.mediaType === "tv";

      if (filters.personName) {
        // Actor/creator ka naam mila hai - pehle person dhundo, phir unka content
        const personData = await searchPerson(filters.personName);
        const person = personData.results?.[0];

        if (person) {
          const data = isTV ? await getTVByPerson(person.id) : await getMoviesByPerson(person.id);
          items = data.results || [];
        } else {
          const data = isTV
            ? await searchTV(filters.keywords || finalPrompt)
            : await searchMovies(filters.keywords || finalPrompt);
          items = data.results || [];
        }
      } else if (filters.matchedAnything) {
        const data = isTV
          ? await discoverTV({ genre: filters.genre, language: filters.language, minRating: filters.minRating })
          : await discoverMovies({ genre: filters.genre, language: filters.language, minRating: filters.minRating });
        items = data.results || [];
      } else {
        // Kuch match nahi hua - keywords (Groq se) ya poora prompt search query ki tarah try karo
        const data = isTV
          ? await searchTV(filters.keywords || finalPrompt)
          : await searchMovies(filters.keywords || finalPrompt);
        items = data.results || [];
      }

      setResults(items.slice(0, 10));
    } catch (err) {
      console.error("Suggestion fetch failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-14 text-center">
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .suggest-card { animation: cardFadeUp 0.5s ease both; }
        .suggest-card:hover .poster-img { transform: scale(1.08); }
        .suggest-card:hover .play-overlay { opacity: 1; }
      `}</style>

      <span
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold"
        style={{ background: "#7C3AED20", color: "#7C3AED" }}
      >
        <Sparkles size={16} />
        AI Suggestions
      </span>

      <h1 className="mt-6 text-3xl md:text-4xl font-extrabold" style={{ fontFamily: "Poppins" }}>
        Tell us your mood
      </h1>
      <p className="mt-3 opacity-70" style={{ fontFamily: "Inter" }}>
        Describe your mood, genre, or taste — movie or TV show, we'll figure out what you mean
      </p>

      {/* Prompt input */}
      <div className="mt-8 max-w-xl mx-auto">
        <div
          className="rounded-2xl flex items-center gap-2 p-2 shadow-xl"
          style={{ background: darkMode ? "#111827" : "#ffffff" }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSuggest();
              }
            }}
            placeholder="e.g. I want a good feel-good comedy, or a crime drama series..."
            rows={2}
            className={`flex-1 bg-transparent px-4 py-2 outline-none resize-none ${
              darkMode ? "text-white placeholder:text-gray-400" : "text-gray-900 placeholder:text-gray-500"
            }`}
            style={{ fontFamily: "Inter" }}
          />
          <button
            onClick={() => handleSuggest()}
            disabled={loading}
            className="p-3 rounded-xl transition hover:scale-105 disabled:opacity-60 shrink-0"
            style={{ background: "#7C3AED" }}
          >
            <Send size={18} color="white" />
          </button>
        </div>

        {/* Example prompts */}
        {!searched && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                onClick={() => handleSuggest(ex)}
                className="px-4 py-2 rounded-full text-sm transition hover:opacity-70"
                style={{
                  background: darkMode ? "#111827" : "#F1F5F9",
                  fontFamily: "Inter",
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mt-10 text-left">
        {!loading && results.length > 0 && (
          <p
            className="text-center text-xs opacity-50 mb-4 flex items-center justify-center gap-1"
            style={{ fontFamily: "Inter" }}
          >
            {usedAI && <Sparkles size={12} />}
            Showing {resultType === "tv" ? "TV show" : "movie"} results
            {usedAI ? " — powered by Groq AI" : ""}
          </p>
        )}
        {loading ? (
          <p className="text-center opacity-60" style={{ fontFamily: "Inter" }}>
            Finding suggestions for you...
          </p>
        ) : searched && results.length === 0 ? (
          <p className="text-center opacity-60" style={{ fontFamily: "Inter" }}>
            No results found. Try describing it a bit differently.
          </p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {results.map((item, index) => (
              <button
                key={item.id}
                onClick={() => navigate(`${resultType === "tv" ? "/tv" : "/movie"}/${item.id}`)}
                className="suggest-card text-left rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 focus:outline-none focus:ring-2"
                style={{
                  background: darkMode ? "#111827" : "#ffffff",
                  animationDelay: `${(index % 10) * 0.06}s`,
                  ringColor: "#7C3AED",
                }}
              >
                <div className="relative overflow-hidden aspect-[2/3]">
                  <img
                    src={getImageUrl(item.poster_path, "w342")}
                    alt={item.title || item.name}
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
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70" style={{ fontFamily: "Inter" }}>
                      {(item.release_date || item.first_air_date)?.slice(0, 4) || "—"}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium">
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      {item.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}