// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import TestDark from "@/components/ThemeToggleTest";
import { toast } from "react-toastify";
import type { User } from "firebase/auth";
import Tasks from "@/components/Dashboard";
import Login from "@/components/Login";
import { TbListCheck } from "react-icons/tb";
import { RxExit } from "react-icons/rx";
import { auth } from "@/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast.error("Logged out successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <TestDark />

      {user ? (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-6 sm:px-0 md:px-0 lg:px-64">
            <div className="flex flex-col">
              <h1 className="flex items-left justify-left text-2xl sm:text-3xl lg:text-3xl font-bold text-[#0F95FF] mb-2">
                <TbListCheck className="pr-2 text-4xl sm:text-5xl" />
                <span className="pb-1 sm:pt-1">TaskWise</span>
              </h1>
              <h2 className="text-base sm:text-lg lg:text-xl text-left mb-6">
                Organize your life, a task at a time.
              </h2>
            </div>

            <div className="flex flex-col items-end mt-2">
              <h3 className="text-sm sm:text-lg font-bold text-white-700">
                Welcome, {user?.displayName || "User"}!
              </h3>
              <button
                onClick={handleLogout}
                className="flex cursor-pointer bg-transparent text-red-500 text-sm"
              >
                <span className="text-sm sm:block pt-3 pr-1">Logout</span>
                <RxExit className="text-lg mt-3" />
              </button>
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
          <h1 className="flex items-center justify-center text-2xl sm:text-3xl lg:text-3xl font-bold text-[#0F95FF] mb-2">
            <TbListCheck className="pr-2 text-4xl sm:text-5xl" />
            TaskWise
          </h1>
          <h2 className="text-base sm:text-lg lg:text-xl text-center mb-6">
            Organize your life, a task at a time.
          </h2>
          <Login />
        </>
      )}
    </div>
  );
}
