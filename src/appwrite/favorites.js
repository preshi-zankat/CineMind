import { ID, Query } from "appwrite";
import { tablesDB } from "./config";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_FAVORITES_TABLE_ID;

// Add Movie or TV Show to favorites
export async function addFavorite(content, userId, contentType) {
  try {
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
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get favorites
export async function getFavorites(userId, contentType = null) {
  try {
    const queries = [
      Query.equal("userId", userId),
    ];

    // If contentType is provided, filter by it
    if (contentType) {
      queries.push(Query.equal("contentType", contentType));
    }

    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries,
    });

    return response.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Check whether Movie/TV Show is already favorite
export async function isFavorite(contentId, userId, contentType) {
  try {
    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [
        Query.equal("contentId", contentId),
        Query.equal("userId", userId),
        Query.equal("contentType", contentType),
      ],
    });

    return response.rows.length > 0 ? response.rows[0] : null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Remove favorite
export async function removeFavorite(rowId) {
  try {
    await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}