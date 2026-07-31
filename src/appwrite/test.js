import { account } from "./config";

export async function testConnection() {
  try {
    const user = await account.get();

    console.log("Logged In User:", user);
  } catch (error) {
    console.log("No user logged in");
    console.log(error);
  }
}