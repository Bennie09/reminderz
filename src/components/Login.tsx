// src/components/Login.tsx
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
import LoadingOverlay from "@/components/LoadingOverlay"; // Make sure this path is correct

export default function Login() {
  const [name, setName] = useState<string>(""); // Username
  const [email, setEmail] = useState<string>(""); // Email
  const [password, setPassword] = useState<string>(""); // Password
  const [error, setError] = useState<string>(""); // Error message
  const [user, setUser] = useState<User | null>(null); // Signed-in user
  const [isSignUp, setIsSignUp] = useState<boolean>(false); // Toggle form
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Place this above your component
  function formatFirebaseError(error: unknown): string {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
    ) {
      const code = (error as { code: string }).code;
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
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      toast.success("Logged in successfully!");
    } catch (err: unknown) {
      const message = formatFirebaseError(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up handler

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!name.trim()) {
      setError("Please enter a username");
      setIsLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(cred.user, { displayName: name.trim() });
      await cred.user.reload();
      const updatedUser = getAuth().currentUser;
      setUser(updatedUser);

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name.trim(),
        createdAt: new Date(),
      });

      // Send welcome email
      await fetch("/api/send-signup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, name }),
      });

      setName("");
      setEmail("");
      setPassword("");

      toast.success("Account created successfully!");
      setTimeout(() => setIsLoading(false), 2000);
    } catch (err: unknown) {
      const message = formatFirebaseError(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If logged in, show greeting + logout
  if (user) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <p className="mb-4 text-gray-300">
          Hello, <strong>{user.displayName || user.email}</strong>!
        </p>
        <button
          onClick={() => signOut(auth)}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  // Otherwise, show login/sign-up form
  return (
    <>
      {isLoading && <LoadingOverlay />}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-md transition-colors">
          <h2 className="text-center text-2xl text-blue-400 font-semibold mb-4">
            {isSignUp ? "Sign Up" : "Login"}
          </h2>
          <form
            onSubmit={isSignUp ? handleSignUp : handleLogin}
            className="space-y-4"
          >
            {error && (
              <p className="text-red-500 text-sm mb-4 border-red-500 border p-2 rounded-lg">
                <span className="font-semibold">Error: </span> {error}
              </p>
            )}

            {isSignUp && (
              <div>
                <label
                  className={`block mb-1 text-gray-300 ${
                    error ? "text-red-500" : ""
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
                  className={`w-full p-2 border ${
                    error ? "border-red-500" : "border-transparent"
                  } rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:focus:border-blue-400 focus:outline-none transition-colors`}
                />
              </div>
            )}

            <div>
              <label
                className={`block mb-1 text-gray-300 ${
                  error ? "text-red-500" : ""
                }`}
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
                className={`w-full p-2 border ${
                  error ? "border-red-500" : "border-transparent"
                } rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:focus:border-blue-400 focus:outline-none transition-colors`}
              />
            </div>

            <div>
              <label
                className={`block mb-1 text-gray-300 ${
                  error ? "text-red-500" : ""
                }`}
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
                className={`w-full p-2 border ${
                  error ? "border-red-500" : "border-transparent"
                } rounded bg-gray-700 text-gray-100 placeholder-gray-400 focus:focus:border-blue-400 focus:outline-none transition-colors`}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white cursor-pointer py-2 rounded-lg hover:hover:bg-blue-700 transition-colors"
            >
              {isSignUp ? "Sign Up" : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-400">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                  }}
                  className="text-blue-400 underline cursor-pointer hover:hover:text-blue-300 transition-colors"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don&rsquo;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className="text-blue-400 underline cursor-pointer hover:hover:text-blue-300 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
