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
    const response = await account.createEmailSession(email, password);
    return response;
  } catch (error) {
    throw error;
  }
};