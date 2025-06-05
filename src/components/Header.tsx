"use client";

import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { TbListCheck } from "react-icons/tb";
import { RxExit } from "react-icons/rx";
// import { FiSun, FiMoon } from "react-icons/fi";
import { auth } from "@/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
// import Link from "next/link";
import Menu from "@/components/MenuComponent";
// import { useTheme } from "next-themes";

import { useRouter } from "next/navigation";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  // const { theme, setTheme } = useTheme();

  // const toggleTheme = () => {
  //   setTheme(theme === "dark" ? "light" : "dark");
  // };

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    toast.error("Logged out successfully!");
  };

  if (!mounted) return null;

  return (
    <div className="flex items-start justify-between mb-6 sm:px-0 md:px-0 lg:px-64 w-full">
      <div className="flex flex-col">
        <h1 className="flex items-left justify-left text-2xl sm:text-3xl lg:text-3xl font-bold text-[#0F95FF] mb-2">
          <TbListCheck className="pr-2 text-4xl sm:text-5xl" />
          <span className="pb-1 sm:pt-1">TaskWise</span>
        </h1>
        <h2 className="text-base sm:text-lg lg:text-xl text-left mb-6 text-gray-300">
          Organize your life, a task at a time.
        </h2>
      </div>

      <div className="flex flex-col items-end mt-2">
        <h3 className="text-sm sm:text-lg font-bold text-gray-300">
          Welcome, {user?.displayName || "User"}!
        </h3>
        <div className="flex items-center space-x-3 mt-2">
          {/* Dark Mode Toggle */}
          {/* Note: Change the default theme in the ThemeProvider component in src/app/layout.tsx from "dark" to "light" if you want the light mode as default. */}
          {/* <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:hover:bg-gray-600 transition-colors"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button> */}

          <Menu />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex cursor-pointer pb-3 bg-transparent text-red-500 text-sm hover:hover:text-red-400 transition-colors"
          >
            <span className="text-sm sm:block pt-3 pr-1">Logout</span>
            <RxExit className="text-lg mt-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuthHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex-1 text-center">
        <h1 className="flex items-center justify-center text-2xl sm:text-3xl lg:text-3xl font-bold text-[#0F95FF] mb-2">
          <TbListCheck className="pr-2 text-4xl sm:text-5xl" />
          TaskWise
        </h1>
        <h2 className="text-base sm:text-lg lg:text-xl text-center mb-6 text-gray-300">
          Organize your life, a task at a time.
        </h2>
      </div>

      {/* Dark Mode Toggle for Login Page */}
      {/* <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:hover:bg-gray-600 transition-colors"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button> */}
    </div>
  );
}
