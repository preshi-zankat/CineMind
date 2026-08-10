// Prompt se movie-relevant filters nikaalta hai (genre, rating, language).
// Ye asli AI/LLM nahi hai - keyword matching hai, isliye simple aur
// pura client-side chalta hai bina kisi API key ke.

const GENRE_KEYWORDS = {
  28: ["action", "fight", "war movie", "explosion"],
  35: ["comedy", "funny", "hasee", "hasi", "laugh", "hilarious"],
  27: ["horror", "dar", "scary", "ghost", "bhoot", "spooky"],
  10749: ["romance", "romantic", "pyaar", "pyar", "love story", "love"],
  53: ["thriller", "suspense", "tense"],
  18: ["drama", "emotional", "sad", "touching"],
  878: ["sci-fi", "scifi", "science fiction", "space", "alien", "future"],
  14: ["fantasy", "magic", "magical"],
  16: ["animation", "cartoon", "anime"],
  10751: ["family", "kids", "bachon", "children"],
  9648: ["mystery", "detective", "whodunit"],
  80: ["crime", "gangster", "heist", "mafia"],
  12: ["adventure", "journey", "expedition"],
  99: ["documentary", "real story", "true story"],
  10402: ["music", "musical"],
};

const RATING_KEYWORDS = [
  { words: ["masterpiece", "legendary", "all time best"], value: 8 },
  { words: ["best", "top rated", "highly rated", "great", "must watch", "acha", "achi"], value: 7 },
];

const LANGUAGE_KEYWORDS = {
  hi: ["hindi", "bollywood"],
  en: ["english", "hollywood"],
  ko: ["korean", "kdrama", "k-drama"],
  ja: ["japanese", "anime"],
  es: ["spanish"],
  fr: ["french"],
  zh: ["chinese"],
  te: ["telugu"],
  ta: ["tamil"],
};

export function parsePrompt(prompt) {
  const text = prompt.toLowerCase();

  const matchedGenres = Object.entries(GENRE_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
    .map(([id]) => id);

  let minRating = null;
  for (const { words, value } of RATING_KEYWORDS) {
    if (words.some((w) => text.includes(w))) {
      minRating = value;
      break;
    }
  }

  let language = null;
  for (const [code, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      language = code;
      break;
    }
  }

  return {
    genre: matchedGenres.length > 0 ? matchedGenres.join("|") : null, // OR match
    minRating,
    language,
    matchedAnything: matchedGenres.length > 0 || minRating || language,
  };
}