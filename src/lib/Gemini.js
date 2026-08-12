

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const GENRE_LIST =
  "Action(28), Adventure(12), Animation(16), Comedy(35), Crime(80), " +
  "Documentary(99), Drama(18), Family(10751), Fantasy(14), History(36), " +
  "Horror(27), Music(10402), Mystery(9648), Romance(10749), Science Fiction(878), " +
  "TV Movie(10770), Thriller(53), War(10752), Western(37)";

const SYSTEM_INSTRUCTION = `You are a movie recommendation assistant. Given a user's free-text prompt describing what kind of movie they want, extract structured search filters for TMDB (The Movie Database) API.

Available TMDB genres with their IDs: ${GENRE_LIST}

Respond ONLY with valid JSON in exactly this shape, no markdown, no code fences, no explanation:
{
  "genreIds": [array of matching genre id numbers as integers, empty array if nothing clearly matches],
  "minRating": number or null (only set if user asks for "best"/"top rated"/"high rating" type phrasing - use 7 for good, 8 for excellent/masterpiece, otherwise null),
  "language": "ISO 639-1 code or null, e.g. hi, en, ko, ja, es, fr, zh, de, te, ta - only if the user names a specific language/industry like Hindi, Korean, Bollywood, Hollywood, Kdrama etc",
  "personName": "full name of an actor, actress, or director if the user mentions one (by full name or well-known nickname/initials like 'SRK' for Shah Rukh Khan) - resolve nicknames to the person's real full name, otherwise null",
  "keywords": "a short 2-5 word plain text search query capturing the essence of the request, useful as a fallback text search - do NOT put an actor/director name here if personName is already set"
}`;

export async function getAIMovieFilters(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY .env mein set nahi hai.");
  }

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini request failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini se khaali response mila.");
  }

  return JSON.parse(text);
}