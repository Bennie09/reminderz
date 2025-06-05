import React from "react";
import { Header } from "@/components/Header";

export default function TestPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
        <Header />
        <h1 className="text-4xl font-bold text-gray-700 dark:text-gray-300">
          Test Title
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This should change color in both modes.
        </p>
        <div className="bg-white dark:bg-black text-black dark:text-white p-8">
          This text and background should change color with dark mode.
        </div>
      </div>
    </>
  );
}
