"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import "react-datepicker/dist/react-datepicker.css";

import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/firebase";

import { CiCirclePlus } from "react-icons/ci";
import { toast } from "react-toastify";
import LoadingOverlay from "@/components/LoadingOverlay"; // Add this import

interface TaskInput {
  title: string;
  details: string;
  date: string;
  time: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskInput>({
    title: "",
    details: "",
    date: "",
    time: "",
  });

  const [error, setError] = useState({ error1: "", error2: "", error3: "" });
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  async function saveTask(task: TaskInput) {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "tasks"), {
      ...task,
      ownerId: user.uid,
      ownerEmail: user.email,
      ownerName: user.displayName,
      completed: false,
      createdAt: new Date(),
      dueAt: new Date(`${task.date}T${task.time}`),
    });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errs = { error1: "", error2: "", error3: "" };
    const titleTrimmed = tasks.title.trim();
    if (!titleTrimmed) errs.error1 = "Task Title cannot be empty";
    if (titleTrimmed.length > 60)
      errs.error1 = "Task Title cannot exceed 60 characters";
    if (!tasks.date) errs.error2 = "Due Date is required";
    if (!tasks.time) errs.error3 = "Reminder Time is required";

    if (errs.error1 || errs.error2 || errs.error3) {
      setError(errs);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setIsLoading(true); // Start loading
    await saveTask({ ...tasks, title: titleTrimmed });
    setTasks({ title: "", details: "", date: "", time: "" });
    setIsLoading(false); // End loading
    toast.success("Task added successfully!");
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTasks((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && value.trim())
      setError((prev) => ({ ...prev, error1: "" }));
  };

  return (
    <div className="flex flex-col items-center">
      {isLoading && <LoadingOverlay />} {/* Loader overlay */}
      {/* Task Form */}
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border dark:border-gray-700">
        <h1 className="text-center text-2xl font-semibold mb-4 text-gray-200 dark:text-gray-300">
          Set Tasks
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              className={`block mb-1 ${
                error.error1
                  ? "text-red-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={tasks.title}
              onChange={handleChange}
              placeholder="E.g., Grocery Shopping"
              className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                error.error1
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {error.error1 && (
              <p className="text-red-500 text-sm mt-1">{error.error1}</p>
            )}
          </div>

          {/* Details */}
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Task Details
            </label>
            <textarea
              name="details"
              value={tasks.details}
              onChange={handleChange}
              rows={3}
              placeholder="Enter additional details.."
              className="w-full p-2 border rounded resize-none bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              className={`block mb-1 ${
                error.error2
                  ? "text-red-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Due Date
            </label>
            <input
              type="date"
              value={tasks.date || ""}
              onChange={(e) =>
                setTasks((prev) => ({ ...prev, date: e.target.value }))
              }
              className={`w-full max-w-2xl p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                error.error2
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Set Reminder Date"
            />
            {error.error2 && (
              <p className="text-red-500 text-sm mt-1">{error.error2}</p>
            )}
          </div>

          {/* Reminder Time */}
          <div>
            <label
              className={`block mb-1 ${
                error.error3
                  ? "text-red-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Reminder Time
            </label>
            <input
              type="time"
              name="time"
              value={tasks.time}
              onChange={handleChange}
              placeholder="Set Reminder Time"
              className={`w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white ${
                error.error3
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {error.error3 && (
              <p className="text-red-500 text-sm mt-1">{error.error3}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white cursor-pointer py-2 rounded transition"
          >
            <CiCirclePlus className="text-xl" />
            <span>Add Task</span>
          </button>
        </form>
      </div>
    </div>
  );
}
