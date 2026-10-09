import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

// Read the saved theme, or use the one the computer prefers
function loadTheme() {
  try {
    const saved = localStorage.getItem("pokhara-bites-theme");
    if (saved) return saved;
  } catch {
    // storage blocked: just use the default
  }

  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(loadTheme);

  // Put the theme on the <html> tag and save it
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("pokhara-bites-theme", theme);
    } catch {
      // storage blocked: the theme still works, it just won't be saved
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return context;
}