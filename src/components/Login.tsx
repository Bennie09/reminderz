"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { getAuth } from "firebase/auth";

export default function Login() {
  const [name, setName] = useState<string>(""); // Username
  const [email, setEmail] = useState<string>(""); // Email
  const [password, setPassword] = useState<string>(""); // Password
  const [error, setError] = useState<string>(""); // Error message
  const [user, setUser] = useState<User | null>(null); // Signed-in user
  const [isSignUp, setIsSignUp] = useState<boolean>(false); // Toggle form

  // ✅ Place this above your component
  function formatFirebaseError(error: unknown): string {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as any).code === "string"
    ) {
      const code = (error as any).code;
      const errorMap: { [key: string]: string } = {
        "auth/invalid-email": "Invalid email address.",
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "Email is already in use.",
        "auth/invalid-credential": "Invalid credentials provided.",
        "auth/weak-password":
          "Password is too weak. It should be at least 6 characters long.",
        "auth/operation-not-allowed": "Email/password sign-in is not enabled.",
        "auth/too-many-requests": "Too many requests. Please try again later.",
        "auth/unknown": "An unknown error occurred.",
      };
      return errorMap[code] || "An unexpected error occurred.";
    }
    return "Login failed.";
  }

  // Subscribe to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setError("");
    });
    return unsubscribe;
  }, []);

  // Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      toast.success("Log In successful!", {
        position: "top-right",
      });
    } catch (err: unknown) {
      const message = formatFirebaseError(err);
      setError(message);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter a username");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(cred.user, { displayName: name.trim() });

      // Reload user to reflect the new display name
      await cred.user.reload();

      // Get the updated user with displayName
      const updatedUser = getAuth().currentUser;

      // Set the updated user manually so UI reflects it immediately
      setUser(updatedUser);

      // Save user to Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name.trim(), // store trimmed name
        createdAt: new Date(),
      });

      // Clear input fields
      setName("");
      setEmail("");
      setPassword("");
      toast.success("Sign Up successful!", {
        position: "top-right",
      });
    } catch (err: unknown) {
      const message = formatFirebaseError(err);
      setError(message);
    }
  };

  // If logged in, show greeting + logout
  if (user) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <p className="mb-4">
          Hello, <strong>{user.displayName || user.email}</strong>!
        </p>
        <button
          onClick={() => signOut(auth)}
          className="w-full bg-red-500 text-white py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    );
  }

  // Otherwise, show login/sign-up form
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-center text-2xl text-blue-500 font-semibold mb-4">
        {isSignUp ? "Sign Up" : "Login"}
      </h2>
      <form
        onSubmit={isSignUp ? handleSignUp : handleLogin}
        className="space-y-4"
      >
        {error && (
          <p className="text-red-500 text-sm mb-4 border-red-500 border p-2 rounded bg-red-100">
            <span className="font-semibold">Error: </span> {error}
          </p>
        )}

        {isSignUp && (
          <div>
            <label
              className={`block mb-1 ${
                error ? "text-red-500" : "text-gray-700"
              }`}
            >
              Username
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Choose a username"
              required
              className={`w-full p-2 border rounded ${
                error ? "border-red-500" : "border-black"
              }`}
            />
          </div>
        )}

        <div>
          <label
            className={`block mb-1 ${error ? "text-red-500" : "text-gray-700"}`}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
            required
            className={`w-full p-2 border rounded ${
              error ? "border-red-500" : "border-black"
            }`}
          />
        </div>

        <div>
          <label
            className={`block mb-1 ${error ? "text-red-500" : "text-gray-700"}`}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="Enter Password"
            required
            className={`w-full p-2 border rounded ${
              error ? "border-red-500" : "border-black"
            }`}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white cursor-pointer py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-black dark:text-white">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError("");
              }}
              className="text-blue-500 underline cursor-pointer"
            >
              Login
            </button>
          </>
        ) : (
          <>
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError("");
              }}
              className="text-blue-500 underline cursor-pointer"
            >
              Sign Up
            </button>
          </>
        )}
      </p>
    </div>
  );
}
