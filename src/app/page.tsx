// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import Tasks from "@/components/Dashboard";
import Login from "@/components/Login";
import { TbListCheck } from "react-icons/tb";
import { RxExit } from "react-icons/rx";
import { FiSun, FiMoon } from "react-icons/fi";
import { auth } from "@/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      {user ? (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-6 sm:px-0 md:px-0 lg:px-64">
            <div className="flex flex-col">
              <h1 className="flex items-left justify-left text-2xl sm:text-3xl lg:text-3xl font-bold text-[#0F95FF] mb-2">
                <TbListCheck className="pr-2 text-4xl sm:text-5xl" />
                <span className="pb-1 sm:pt-1">TaskWise</span>
              </h1>
              <h2 className="text-base sm:text-lg lg:text-xl text-left mb-6 text-gray-700 dark:text-gray-300">
                Organize your life, a task at a time.
              </h2>
            </div>

            <div className="flex flex-col items-end mt-2">
              <h3 className="text-sm sm:text-lg font-bold text-gray-700 dark:text-gray-300">
                Welcome, {user?.displayName || "User"}!
              </h3>
              <div className="flex items-center space-x-3 mt-2">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title={
                    isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer bg-transparent text-red-500 dark:text-red-400 text-sm hover:text-red-600 dark:hover:text-red-300 transition-colors"
                >
                  <span className="text-sm sm:block pt-3 pr-1">Logout</span>
                  <RxExit className="text-lg mt-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Task Dashboard */}
          <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
            <Tasks />
          </div>
        </>
      ) : (
        <>
          {/* Landing / Login */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 text-center">
              <h1 className="flex items-center justify-center text-2xl sm:text-3xl lg:text-3xl font-bold text-[#0F95FF] mb-2">
                <TbListCheck className="pr-2 text-4xl sm:text-5xl" />
                TaskWise
              </h1>
              <h2 className="text-base sm:text-lg lg:text-xl text-center mb-6 text-gray-700 dark:text-gray-300">
                Organize your life, a task at a time.
              </h2>
            </div>

            {/* Dark Mode Toggle for Login Page */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title={
                isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
              }
            >
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>

          <Login />
        </>
      )}
    </div>
  );
}
