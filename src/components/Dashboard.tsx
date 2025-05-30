"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Timestamp } from "firebase/firestore";
import DatePicker, { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { auth, db } from "@/firebase";

import { IoTrashBin } from "react-icons/io5";
import { CiCircleCheck, CiCirclePlus } from "react-icons/ci";
import { LuNotebookText } from "react-icons/lu";
import { toast } from "react-toastify";

registerLocale("en-GB", enGB);

interface TaskInput {
  title: string;
  details: string;
  date: string;
  time: string;
}

interface Entry extends TaskInput {
  id: string;
  completed: boolean;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<TaskInput>({
    title: "",
    details: "",
    date: "",
    time: "",
  });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState({ error1: "", error2: "", error3: "" });

  // Load tasks for current user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const tasksQuery = query(
      collection(db, "tasks"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
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
    });

    return () => unsubscribe();
  }, []);

  // Save a new task
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
      dueAt: Timestamp.fromDate(new Date(`${task.date}T${task.time}`)),
    });
  }

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errs = { error1: "", error2: "", error3: "" };
    const titleTrimmed = tasks.title.trim();
    if (!titleTrimmed) errs.error1 = "Task Title cannot be empty";
    if (titleTrimmed.length > 60)
      errs.error1 = "Task Title cannot exceed 60 characters";
    if (
      entries.some(
        (entry) =>
          entry.title.trim().toLowerCase() === titleTrimmed.toLowerCase()
      )
    ) {
      errs.error1 = "Task Title already exists";
    }
    if (!tasks.date) errs.error2 = "Due Date is required";
    if (!tasks.time) errs.error3 = "Reminder Time is required";

    if (errs.error1 || errs.error2 || errs.error3) {
      setError(errs);
      return;
    }

    await saveTask({ ...tasks, title: titleTrimmed });
    setTasks({ title: "", details: "", date: "", time: "" });
    toast.success("Task added successfully!");
    // const userEmail = auth.currentUser!.email!;
    // await scheduleEmail(
    //   userEmail,
    //   `Reminder: ${titleTrimmed}`,
    //   tasks.details || "No details provided.",
    //   tasks.date,
    //   tasks.time
    // );
  };

  // Handle date selection
  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      setTasks((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
      setError((prev) => ({ ...prev, error2: "" }));
    }
  };

  // Handle other input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTasks((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && value.trim())
      setError((prev) => ({ ...prev, error1: "" }));
  };

  // Toggle completion
  const toggleComplete = async (id: string, done: boolean) => {
    await updateDoc(doc(db, "tasks", id), { completed: !done });
    toast.success(`Task marked as ${done ? "incomplete" : "completed"}!`);
  };

  // Delete task
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
    toast.success("Task deleted successfully!");
  };

  // Clear error messages after 3s
  useEffect(() => {
    if (error.error1 || error.error2 || error.error3) {
      const timer = setTimeout(
        () => setError({ error1: "", error2: "", error3: "" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center">
      {/* Task Form */}
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
            <DatePicker
              selected={tasks.date ? new Date(tasks.date) : null}
              onChange={handleDateChange}
              locale="en-GB"
              dateFormat="yyyy-MM-dd"
              placeholderText="Set Reminder Date"
              className={`w-full max-w-2xl p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                error.error2
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
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

      {/* Task List */}
      <div className="w-full max-w-2xl space-y-4 mt-6">
        {entries.length > 0 ? (
          <>
            <h1 className="text-center text-2xl font-semibold mb-4 text-black dark:text-white">
              Your Tasks
            </h1>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border dark:border-gray-700 flex flex-col sm:flex-col sm:justify-between"
              >
                <div>
                  <h3
                    className={`text-lg font-semibold whitespace-pre-wrap break-words text-gray-200 dark:text-gray-300 ${
                      entry.completed
                        ? "line-through text-gray-400 dark:text-gray-500 flex flex-col"
                        : ""
                    }`}
                  >
                    {entry.title}
                  </h3>
                  <p
                    className={`whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300 ${
                      entry.completed
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : ""
                    }`}
                  >
                    {entry.details}
                  </p>

                  <p
                    className={`text-md mt-1 text-gray-600 dark:text-gray-400 ${
                      entry.completed
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : ""
                    }`}
                  >
                    <strong>Due:</strong> {entry.date}
                    {entry.time && (
                      <>
                        {" "}
                        at <span className="font-medium">{entry.time}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-3">
                  <button
                    onClick={() => toggleComplete(entry.id, entry.completed)}
                    className={`flex items-center px-3 py-1 rounded transition ${
                      entry.completed
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-green-400 hover:bg-green-500 text-white"
                    }`}
                  >
                    <CiCircleCheck className="mr-1" />
                    {entry.completed ? "Undo" : "Done"}
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex items-center bg-red-400 hover:bg-red-500 text-white py-1 px-3 rounded transition"
                  >
                    <IoTrashBin className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <LuNotebookText className="mx-auto text-5xl mb-4" />
            <p className="text-lg font-semibold">No Tasks Yet!</p>
            <p>Add a new task to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
