import { ID } from "appwrite";
import { storage } from "./config";

const PROFILE_BUCKET_ID = import.meta.env.VITE_APPWRITE_PROFILE_BUCKET_ID;

// Naya profile image upload karta hai, Appwrite File object return karta hai
export async function uploadProfileImage(file) {
  return await storage.createFile(PROFILE_BUCKET_ID, ID.unique(), file);
}

// File id se viewable image URL banata hai
export function getProfileImageUrl(fileId) {
  if (!fileId) return null;
  return storage.getFileView(PROFILE_BUCKET_ID, fileId).toString();
}

// Purani image delete karta hai (naya upload karne se pehle, storage clean rakhne ke liye)
export async function deleteProfileImage(fileId) {
  if (!fileId) return;
  return await storage.deleteFile(PROFILE_BUCKET_ID, fileId);
}