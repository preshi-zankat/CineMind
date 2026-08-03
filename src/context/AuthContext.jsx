import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../appwrite/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
  try {
    const currentUser = await getCurrentUser();

    console.log("Current User:", currentUser);

    setUser(currentUser);
  } catch (error) {
    console.log(error);

    setUser(null);
  } finally {
    setLoading(false);
  }
}

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);