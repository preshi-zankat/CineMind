

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const MOVIE_GENRE_LIST =
  "Action(28), Adventure(12), Animation(16), Comedy(35), Crime(80), " +
  "Documentary(99), Drama(18), Family(10751), Fantasy(14), History(36), " +
  "Horror(27), Music(10402), Mystery(9648), Romance(10749), Science Fiction(878), " +
  "TV Movie(10770), Thriller(53), War(10752), Western(37)";

// TV genre IDs movies se thode alag hote hai TMDB mein
const TV_GENRE_LIST =
  "Action & Adventure(10759), Animation(16), Comedy(35), Crime(80), " +
  "Documentary(99), Drama(18), Family(10751), Kids(10762), Mystery(9648), " +
  "News(10763), Reality(10764), Sci-Fi & Fantasy(10765), Soap(10766), " +
  "Talk(10767), War & Politics(10768), Western(37)";

const SYSTEM_INSTRUCTION = `You are a movie and TV show recommendation assistant. Given a user's free-text prompt, first decide whether they want a MOVIE or a TV SHOW (series), then extract structured search filters for TMDB (The Movie Database) API.

How to decide mediaType:
- Words like "series", "show", "season", "episode", "web series", "sitcom", "binge", or a known TV show name/style -> "tv"
- Words like "movie", "film", or nothing specific mentioned -> "movie" (this is the default when unclear)

Movie genres with their IDs: ${MOVIE_GENRE_LIST}
TV show genres with their IDs: ${TV_GENRE_LIST}

Use the genre ID list that matches the mediaType you picked.

Respond ONLY with valid JSON in exactly this shape, no markdown, no code fences, no explanation:
{
  "mediaType": "movie" or "tv",
  "genreIds": [array of matching genre id numbers as integers from the correct list above, empty array if nothing clearly matches],
  "minRating": number or null (only set if user asks for "best"/"top rated"/"high rating" type phrasing - use 7 for good, 8 for excellent/masterpiece, otherwise null),
  "language": "ISO 639-1 code or null, e.g. hi, en, ko, ja, es, fr, zh, de, te, ta - only if the user names a specific language/industry like Hindi, Korean, Bollywood, Hollywood, Kdrama etc",
  "personName": "full name of an actor, actress, or creator/director if the user mentions one (by full name or well-known nickname/initials like 'SRK' for Shah Rukh Khan) - resolve nicknames to the person's real full name, otherwise null",
  "keywords": "a short 2-5 word plain text search query capturing the essence of the request, useful as a fallback text search - do NOT put an actor/director name here if personName is already set"
}`;

export async function getAIFilters(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error("VITE_GROQ_API_KEY .env mein set nahi hai.");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq request failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Groq se khaali response mila.");
  }

  return JSON.parse(text);
}