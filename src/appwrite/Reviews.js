import { ID, Query } from "appwrite";
import { tablesDB } from "./config";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_REVIEWS_TABLE_ID;

// Add a new review
export async function addReview({
  contentId,
  contentType,
  userId,
  userName,
  rating,
  reviewText,
}) {
  return await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: ID.unique(),

    data: {
      userId,
      userName,
      contentId,
      contentType,
      rating,
      review: reviewText,
    },
  });
}

// Get reviews for a specific Movie or TV Show
export async function getContentReviews(contentId, contentType) {
  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,

    queries: [
      Query.equal("contentId", contentId),
      Query.equal("contentType", contentType),
      Query.orderDesc("$createdAt"),
    ],
  });

  return response.rows;
}

// Get logged-in user's reviews
export async function getUserReviews(userId) {
  const response = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,

    queries: [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
    ],
  });

  return response.rows;
}

// Update existing review
export async function updateReview(
  rowId,
  { rating, reviewText }
) {
  return await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId,

    data: {
      rating,
      review: reviewText,
    },
  });
}

// Delete review
export async function deleteReview(rowId) {
  return await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId,
  });
}