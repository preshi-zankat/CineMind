import { ID, Query } from "appwrite";
import { tablesDB } from "./config";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_WATCHLIST_TABLE_ID;

// Add Movie
export async function addToWatchlist(movie, userId) {
  return await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: ID.unique(),
    data: {
      userId,
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster_path,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      status: "Plan to Watch",
    },
  });
}

// Get User Watchlist
export async function getWatchlist(userId) {
  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    queries: [
      Query.equal("userId", userId),
    ],
  });

  return response.rows;
}

// Check if movie already exists
export async function isInWatchlist(movieId, userId) {
  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    queries: [
      Query.equal("movieId", movieId),
      Query.equal("userId", userId),
    ],
  });

  return response.rows.length > 0 ? response.rows[0] : null;
}

// Remove Movie
export async function removeFromWatchlist(rowId) {
  return await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId,
  });
}

// Update status (Plan to Watch / Watching / Watched)
export async function updateWatchlistStatus(rowId, status) {
  return await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId,
    data: { status },
  });
}