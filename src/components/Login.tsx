"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    }
  };

  // Sign-up handler
  const auth = getAuth(); // your auth instance

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-up failed";
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
        {isSignUp && (
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Choose a username"
              required
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="Enter Password"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white cursor-pointer py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
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
