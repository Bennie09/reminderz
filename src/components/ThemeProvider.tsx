"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (isDark) {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
    console.log("Dark mode:", isDark);
  }, [isDark]);

  return (
    <>
      <button
        onClick={() => setIsDark((prev) => !prev)}
        className="fixed bottom-4 left-4 bg-gray-200 dark:bg-gray-800 rounded-full p-3 shadow-md z-50"
      >
        {isDark ? "🌙" : "☀️"}
      </button>
      {children}
    </>
  );
}
