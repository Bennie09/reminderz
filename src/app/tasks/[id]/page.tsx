"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-toastify";
import { IoTrashBin } from "react-icons/io5";
import { CiCircleCheck } from "react-icons/ci";
import { LuPen } from "react-icons/lu";
import { Header } from "@/components/Header";
import Link from "next/link";
import { LuUndo2 } from "react-icons/lu";
import LoadingOverlay from "@/components/LoadingOverlay"; // <-- Add this import

interface Entry {
  id: string;
  title: string;
  details: string;
  date: string;
  time: string;
  completed: boolean;
}

export default function TaskDetailsPage() {
  const params = useParams() as { id?: string | string[] };
  const id = params.id;
  const router = useRouter();
  const [task, setTask] = useState<Entry | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    details: "",
    date: "",
    time: "",
  });
  const [isLoading, setIsLoading] = useState(true); // <-- Add loading state

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true); // <-- Start loading
      const docRef = doc(db, "tasks", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTask({ id: docSnap.id, ...data } as Entry);
        setForm({
          title: data.title || "",
          details: data.details || "",
          date: data.date || "",
          time: data.time || "",
        });
      } else {
        toast.error("Task not found!");
        router.push("/tasks");
      }
      setIsLoading(false); // <-- End loading
    };

    fetchTask();
  }, [id, router]);

  const handleDelete = async () => {
    setIsLoading(true); // <-- Start loading
    await deleteDoc(doc(db, "tasks", id as string));
    toast.success("Task deleted!");
    setIsLoading(false); // <-- End loading
    router.push("/tasks");
  };

  const toggleComplete = async () => {
    await updateDoc(doc(db, "tasks", id as string), {
      completed: !task?.completed,
    });
    toast.success(
      `Task marked as ${task?.completed ? "incomplete" : "completed"}!`
    );
    setTask((prev) => prev && { ...prev, completed: !prev.completed });
  };

  const handleUpdate = async () => {
    if (!form.title.trim() || !form.date.trim() || !form.time.trim()) {
      toast.error("All fields are required.");
      return;
    }
    setIsLoading(true); // <-- Start loading
    await updateDoc(doc(db, "tasks", id as string), { ...form });
    toast.success("Task updated!");
    setTask((prev) => prev && { ...prev, ...form });
    setEditing(false);
    setIsLoading(false); // <-- End loading
  };

  if (!task && !isLoading) return <p className="p-4">Task not found.</p>;

  return (
    <div className="w-full px-4 sm:px-8 mt-5 mx-auto">
      {isLoading && <LoadingOverlay />} {/* <-- Loader here */}
      <div className="mb-4">
        <Header />
      </div>
      <div className="max-w-xl mx-auto mb-4 ">
        <Link
          href="/tasks"
          className="text-sm border-none bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md inline-block "
        >
          <LuUndo2 />
        </Link>
      </div>
      <div className="p-4 max-w-xl mb-6 mx-auto bg-gray-800 rounded-lg shadow-md border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-gray-300 text-center">
          Task Details
        </h1>
        {editing ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 text-md font-semibold border rounded-md border-transparent focus:focus:border-blue-400 focus:outline-none transition-colors bg-gray-700 text-gray-100 placeholder-gray-400"
            />
            <textarea
              placeholder="Details"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              rows={5}
              className="w-full p-3 resize-none border rounded-md border-transparent focus:focus:border-blue-400 focus:outline-none transition-colors bg-gray-700 text-gray-100 placeholder-gray-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="p-2 border rounded-md border-transparent focus:focus:border-blue-400 focus:outline-none transition-colors bg-gray-700 text-gray-100 placeholder-gray-400"
              />
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="p-2 border rounded-md border-transparent focus:focus:border-blue-400 focus:outline-none transition-colors bg-gray-700 text-gray-100 placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md w-full text-md"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-2">{task?.title}</h1>
            <p className="mb-4 text-gray-500">{task?.details}</p>
            <p className="text-gray-500 mb-2">
              📅 {task?.date} &nbsp; 🕒 {task?.time}
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={toggleComplete}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            disabled={isLoading}
          >
            <CiCircleCheck size={18} />
            {task?.completed ? "Mark Incomplete" : "Mark Done"}
          </button>

          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
            disabled={isLoading}
          >
            <LuPen size={18} />
            {editing ? "Cancel" : "Edit"}
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            disabled={isLoading}
          >
            <IoTrashBin size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
