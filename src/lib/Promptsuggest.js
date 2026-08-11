

const MOVIE_GENRE_KEYWORDS = {
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

// TV genre IDs TMDB mein movies se alag hote hai
const TV_GENRE_KEYWORDS = {
  10759: ["action", "adventure", "fight", "journey"],
  35: ["comedy", "funny", "hasee", "hasi", "laugh", "hilarious"],
  10765: ["sci-fi", "scifi", "science fiction", "fantasy", "magic", "space", "alien"],
  18: ["drama", "emotional", "sad", "touching"],
  16: ["animation", "cartoon", "anime"],
  10751: ["family", "kids", "bachon", "children"],
  9648: ["mystery", "detective", "whodunit", "suspense", "thriller"],
  80: ["crime", "gangster", "heist", "mafia"],
  99: ["documentary", "real story", "true story"],
  10768: ["war", "politics", "political"],
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

const TV_INDICATOR_WORDS = [
  "series", "show", "shows", "season", "episode", "web series", "webseries",
  "sitcom", "binge", "tv show", "drama series",
];

// mediaType khud detect karta hai prompt se - "series"/"show" jaise words se
function detectMediaType(text) {
  return TV_INDICATOR_WORDS.some((w) => text.includes(w)) ? "tv" : "movie";
}

// mediaType pass mat kar - ye khud detect karta hai prompt se
export function parsePrompt(prompt) {
  const text = prompt.toLowerCase();
  const mediaType = detectMediaType(text);
  const genreKeywords = mediaType === "tv" ? TV_GENRE_KEYWORDS : MOVIE_GENRE_KEYWORDS;

  const matchedGenres = Object.entries(genreKeywords)
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
    mediaType,
    genre: matchedGenres.length > 0 ? matchedGenres.join("|") : null, // OR match
    minRating,
    language,
    matchedAnything: matchedGenres.length > 0 || minRating || language,
  };
}