import { account } from "./config";
import { ID } from "appwrite";

export const signup = async ({ name, email, password }) => {
  try {
    const response = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    return response;
  } catch (error) {
    throw error;
  }
};

export const login = async ({ email, password }) => {
  try {
    const session = await account.createEmailPasswordSession(
      email,
      password
    );

    return session;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    return await account.get();

     
  } catch (error) {
    return null;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    throw error;
  }
};