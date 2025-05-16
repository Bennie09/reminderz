"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Timestamp } from "firebase/firestore";
import DatePicker, { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import axios from "axios";
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
  const [error, setError] = useState({ error1: "", error2: "" });

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
        // now assert to your Entry type
        const entry: Entry = {
          id: d.id,
          title: data.title,
          details: data.details,
          date: data.date,
          time: data.time ?? "",
          completed: data.completed,
        };
        return entry;
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
      completed: false,
      createdAt: new Date(),
      dueAt: Timestamp.fromDate(new Date(`${task.date}T${task.time}`)),
    });
  }

  const scheduleEmail = async (
    email: string,
    subject: string,
    content: string,
    date: string,
    time: string
  ) => {
    const scheduledDateTime = new Date(`${date}T${time}:00`);
    const isoTime = scheduledDateTime.toISOString();

    await fetch(
      "https://qstash.upstash.io/v1/publish/https://your-site.netlify.app/.netlify/functions/sendEmail",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_QSTASH_TOKEN}`, // Or use server proxy
          "Upstash-Delay": `until=${isoTime}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          subject,
          content,
        }),
      }
    );
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErr = { error1: "", error2: "" };
    const titleTrimmed = tasks.title.trim();
    if (!titleTrimmed) newErr.error1 = "Task Title cannot be empty";
    if (titleTrimmed.length > 60)
      newErr.error1 = "Task Title cannot exceed 60 characters";
    if (
      entries.some(
        (entry) =>
          entry.title.trim().toLowerCase() === titleTrimmed.toLowerCase()
      )
    ) {
      newErr.error1 = "Task Title already exists";
    }
    if (!tasks.date) newErr.error2 = "Due Date is required";

    if (newErr.error1 || newErr.error2) {
      setError(newErr);
      return;
    }

    await saveTask({ ...tasks, title: titleTrimmed });
    setTasks({ title: "", details: "", date: "", time: "" });

    await scheduleEmail(
      auth.currentUser?.email || "fallback@email.com",
      `Reminder: ${titleTrimmed}`,
      tasks.details || "No details provided.",
      tasks.date,
      tasks.time // Make sure time field exists and is valid
    );
  };

  // Toggle completion
  const toggleComplete = async (id: string, done: boolean) => {
    await updateDoc(doc(db, "tasks", id), { completed: !done });
  };

  // Delete task
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTasks((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && value.trim())
      setError((err) => ({ ...err, error1: "" }));
    if (name === "date" && value.trim())
      setError((err) => ({ ...err, error2: "" }));
  };

  // Clear error messages after 3s
  useEffect(() => {
    if (error.error1 || error.error2) {
      const timer = setTimeout(
        () => setError({ error1: "", error2: "" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center">
      {/* Task Form */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-center text-2xl font-semibold mb-4">Set Tasks</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              className={`block mb-1 ${
                error.error1 ? "text-red-500" : "text-gray-700"
              }`}
            >
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={tasks.title}
              onChange={handleChange}
              placeholder="E.g., Complete React project"
              className="w-full p-2 border rounded"
            />
            {error.error1 && (
              <p className="text-red-500 text-sm mt-1">{error.error1}</p>
            )}
          </div>

          {/* Details */}
          <div>
            <label className="block mb-1 text-gray-700">Task Details</label>
            <textarea
              name="details"
              value={tasks.details}
              onChange={handleChange}
              rows={3}
              placeholder="Enter additional details..."
              className="w-full p-2 border rounded resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label
              className={`block mb-1 ${
                error.error2 ? "text-red-500" : "text-gray-700"
              }`}
            >
              Due Date
            </label>
            <DatePicker
              selected={tasks.date ? new Date(tasks.date) : null}
              onChange={(date) =>
                handleChange({
                  target: {
                    name: "date",
                    value:
                      date instanceof Date && !isNaN(date.getTime())
                        ? format(date, "yyyy-MM-dd")
                        : "",
                  },
                } as any)
              }
              locale="en-GB"
              dateFormat="yyyy-MM-dd"
              placeholderText="Set Reminder Date"
              className="w-full max-w-2xl p-2 border rounded"
            />
            {error.error2 && (
              <p className="text-red-500 text-sm mt-1">{error.error2}</p>
            )}
          </div>

          {/* Reminder Time */}

          <label className="block mb-1 text-gray-700">
            Reminder Time ( 24hr )
          </label>
          <input
            type="time"
            name="time"
            value={tasks.time}
            onChange={handleChange}
            placeholder="Set Reminder Time"
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            <CiCirclePlus className="text-xl" />
            <span>Add Task</span>
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="w-full max-w-2xl space-y-4 mt-6">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-column sm:justify-between"
            >
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    entry.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  {entry.title}
                </h3>
                <p
                  className={`${
                    entry.completed ? "line-through text-gray-400" : ""
                  }`}
                >
                  {entry.details}
                </p>
                <p className="text-md mt-1">
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
                  className={`flex items-center px-3 py-1 rounded ${
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
          ))
        ) : (
          <div className="text-center text-gray-500 py-12">
            <LuNotebookText className="mx-auto text-5xl mb-4" />
            <p className="text-lg font-semibold">No Tasks Yet!</p>
            <p>Add a new task to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
