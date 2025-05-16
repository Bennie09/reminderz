"use client";

import { useState } from "react";

export default function SendTestPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendTestEmail = async () => {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "🔔 Reminderz Test Email",
        htmlContent: "<h2>This is a test email from Reminderz 🔥</h2>",
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("✅ Email sent successfully!");
    } else {
      setMessage(
        "❌ Failed to send email: " + data.error?.message || "Unknown error"
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-bold">Send Test Email</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email address"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={sendTestEmail}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Send Test Email
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
