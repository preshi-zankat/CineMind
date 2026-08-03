import { ID, Query } from "appwrite";
import { tablesDB } from "./config";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_FAVORITES_TABLE_ID;

export async function addFavorite(movie, userId) {
  try {
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
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getFavorites(userId) {
  try {
    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [
        Query.equal("userId", userId),
      ],
    });

    return response.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function isFavorite(movieId, userId) {
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

export async function removeFavorite(rowId) {
  await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId,
  });
}