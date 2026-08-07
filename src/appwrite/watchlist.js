import { ID, Query } from "appwrite";
import { tablesDB } from "./config";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_WATCHLIST_TABLE_ID;

// Add Movie or TV Show
export async function addToWatchlist(
  content,
  userId,
  contentType
) {
  return await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: ID.unique(),

    data: {
      userId,
      contentId: content.id,
      contentType,
      title: content.title || content.name,
      poster: content.poster_path,
      rating: content.vote_average,
      releaseDate:
        content.release_date || content.first_air_date,
      status: "Plan to Watch",
    },
  });
}

// Get User Watchlist
export async function getWatchlist(
  userId,
  contentType = null
) {
  const queries = [
    Query.equal("userId", userId),
  ];

  if (contentType) {
    queries.push(
      Query.equal("contentType", contentType)
    );
  }

  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    queries,
  });

  return response.rows;
}

// Check if Movie/TV Show already exists
export async function isInWatchlist(
  contentId,
  userId,
  contentType
) {
  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,

    queries: [
      Query.equal("contentId", contentId),
      Query.equal("userId", userId),
      Query.equal("contentType", contentType),
    ],
  });

  return response.rows.length > 0
    ? response.rows[0]
    : null;
}

// Remove Movie/TV Show
export async function removeFromWatchlist(rowId) {
  return await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId,
  });
}

// Update status
export async function updateWatchlistStatus(
  rowId,
  status
) {
  return await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      status,
    },
  });
}