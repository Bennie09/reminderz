// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Header, AuthHeader } from "@/components/Header";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-300">
      {user ? (
        <>
          <Header />
          <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
            <Dashboard />
          </div>
        </>
      ) : (
        <>
          <AuthHeader />
          <Login />
        </>
      )}
    </div>
  );
}
