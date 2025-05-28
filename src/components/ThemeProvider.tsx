"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run after component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    } else if (savedTheme === "light") {
      setIsDark(false);
    } else {
      // Default to system preference
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;

    if (isDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    console.log("Dark mode:", isDark, "HTML classes:", html.className);
  }, [isDark, mounted]);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <>
      <button
        onClick={() => setIsDark((prev) => !prev)}
        className="fixed bottom-4 left-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-3 shadow-md z-50 transition-colors duration-200"
        aria-label="Toggle dark mode"
      >
        {isDark ? "🌙" : "☀️"}
      </button>
      {children}
    </>
  );
}
