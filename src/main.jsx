import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
  position="top-right"
  toastOptions={{
    duration: 2500,
    style: {
      background: "#111827",
      color: "#fff",
      border: "1px solid #7C3AED",
    },
    success: {
      iconTheme: {
        primary: "#10B981",
        secondary: "#fff",
      },
    },
    error: {
      iconTheme: {
        primary: "#EF4444",
        secondary: "#fff",
      },
    },
  }}
/>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);