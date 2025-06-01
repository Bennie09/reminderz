"use client";

import Tasks from "@/components/Tasks";
import { useState, useEffect } from "react";
import LoadingOverlay from "@/components/LoadingOverlay"; // Adjust path if needed

export default function TasksPage() {
  const [isLoading, setIsLoading] = useState(true);
  // ...other state...

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      // ...fetch tasks logic...
      setIsLoading(false);
    };
    fetchTasks();
  }, []);

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Tasks />
    </>
  );
}
