"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";

import { IoTrashBin } from "react-icons/io5";
import { CiCircleCheck } from "react-icons/ci";
import { LuEye } from "react-icons/lu";
import { LuNotebookText } from "react-icons/lu";
import { toast } from "react-toastify";
import { LuPlus } from "react-icons/lu";
import { LuMinus } from "react-icons/lu";
import Link from "next/link";
import { Header } from "@/components/Header";
import LoadingOverlay from "@/components/LoadingOverlay"; // Add this import

interface Entry {
  id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  completed: boolean;
}

const TASKS_PER_PAGE = 10;

export default function TasksPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const router = useRouter();

  useEffect(() => {
    let unsubscribeTasks: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsLoading(false); // Stop loading if not logged in
        return;
      }

      setIsLoading(true); // Start loading when user is authenticated

      const tasksQuery = query(
        collection(db, "tasks"),
        where("ownerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubscribeTasks = onSnapshot(
        tasksQuery,
        (snapshot) => {
          const docs = snapshot.docs.map((d) => {
            const data = d.data() as DocumentData;
            return {
              id: d.id,
              title: data.title,
              details: data.details,
              date: data.date,
              time: data.time ?? "",
              completed: data.completed,
            } as Entry;
          });
          setEntries(docs);
          setIsLoading(false); // Stop loading after data is fetched
        },
        (error) => {
          setIsLoading(false); // Stop loading on error
          if (error.code === "permission-denied") {
            console.warn("Permission denied: likely logged out.");
            setEntries([]); // Clear tasks from UI
          } else {
            console.error("Firestore snapshot error:", error);
          }
        }
      );
    });

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      unsubscribeAuth();
    };
  }, []);

  const toggleComplete = async (id: string, done: boolean) => {
    await updateDoc(doc(db, "tasks", id), { completed: !done });
    toast.success(`Task marked as ${done ? "incomplete" : "completed"}!`);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
    toast.success("Task deleted successfully!");
  };

  const startIdx = (page - 1) * TASKS_PER_PAGE;
  const paginatedTasks = entries.slice(startIdx, startIdx + TASKS_PER_PAGE);
  const totalPages = Math.ceil(entries.length / TASKS_PER_PAGE);

  const pageBtn = (p: number) =>
    `px-3 py-1 rounded-md border dark:border-gray-600 text-sm font-medium transition-all ${
      page === p
        ? "bg-blue-500 text-white dark:bg-blue-600"
        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    }`;

  return (
    <>
      {isLoading && <LoadingOverlay />} {/* Loader overlay */}
      <div className="w-full px-4 sm:px-8 mt-5 mx-auto">
        <Header />
      </div>
      <div className="w-full max-w-2xl mx-auto mt-6 space-y-4 px-4 pb-10 ">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="flex items-center bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            <LuPlus className="mr-2" />
            Add New Task
          </Link>
          <div className="flex items-center space-x-10">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LuMinus />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LuPlus />
            </button>
          </div>
        </div>
        {entries.length > 0 ? (
          <>
            <h1 className="text-center text-2xl font-semibold mb-4 text-black dark:text-white">
              Your Tasks
            </h1>
            <div className="grid grid-cols-1 gap-4">
              {paginatedTasks.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => router.push(`/tasks/${entry.id}`)}
                  className="cursor-pointer bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border dark:border-gray-700 hover:ring-2 hover:ring-blue-400 transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <h3
                        className={`text-lg font-semibold ${
                          entry.completed
                            ? "line-through dark:text-gray-500"
                            : ""
                        }`}
                      >
                        {entry.title}
                      </h3>
                      <p
                        className={`text-sm text-gray-600 dark:text-gray-400 ${
                          entry.completed
                            ? "line-through dark:text-gray-500"
                            : ""
                        }`}
                      >
                        Due: {entry.date}
                      </p>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          toggleComplete(entry.id, entry.completed)
                        }
                        className="text-green-500 hover:text-green-600 text-xl"
                      >
                        <CiCircleCheck />
                      </button>
                      <button
                        onClick={() => router.push(`/tasks/${entry.id}`)}
                        className="text-blue-500 hover:text-blue-600 text-xl"
                      >
                        <LuEye />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-600 text-xl"
                      >
                        <IoTrashBin />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2 flex-wrap">
                {/* First page + left ellipsis */}
                {page > 2 && (
                  <>
                    <button onClick={() => setPage(1)} className={pageBtn(1)}>
                      1
                    </button>
                    {page > 3 && (
                      <span className="px-1 text-gray-500">...</span>
                    )}
                  </>
                )}

                {/* Page numbers around current */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === page || p === page - 1 || p === page + 1)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={pageBtn(p)}
                    >
                      {p}
                    </button>
                  ))}

                {/* Right ellipsis + last page */}
                {page < totalPages - 1 && (
                  <>
                    {page < totalPages - 2 && (
                      <span className="px-1 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setPage(totalPages)}
                      className={pageBtn(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <LuNotebookText className="mx-auto text-5xl mb-4" />
            <p className="text-lg font-semibold">No Tasks Yet!</p>
            <p>Add a new task to get started.</p>
          </div>
        )}
      </div>
    </>
  );
}
