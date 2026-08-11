import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Pehli baar localStorage se saved theme uthao, warna default dark
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("cinemind-theme");
      if (saved !== null) return saved === "dark";
    } catch {
      // localStorage access fail ho sakta hai (private browsing etc) - default pe chalo
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("cinemind-theme", darkMode ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const value = {
    darkMode,
    setDarkMode,
    toggleDarkMode,
    bg: darkMode ? "#0F172A" : "#F8FAFC",
    color: darkMode ? "#F8FAFC" : "#111827",
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom hook - isse koi bhi component seedha darkMode access kar sakta hai
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return context;
}