// NOTE: ye "account" export tere config.js mein already hona chahiye,
// jaise "tablesDB" hai (login/signup/logout ke liye already use ho raha hoga).
// Agar naam different hai to yaha import line adjust kar dena.
import { account } from "./config";

// User ka display name update karta hai
export async function updateUserName(name) {
  return await account.updateName(name);
}

// User ke prefs mein data store karta hai (profile image ka fileId yahi rakhenge)
export async function updateUserPrefs(prefs) {
  return await account.updatePrefs(prefs);
}