// trigger/jobs/send-reminder-emails.ts

import { schedules } from "@trigger.dev/sdk/v3";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// 1️⃣ Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

export const sendReminderEmails = schedules.task({
  id: "send-reminder-emails",
  cron: "*/5 * * * *", // every 5 minutes
  run: async () => {
    const now = Timestamp.now();
    const fiveAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 60_000));
    console.log(
      "Checking tasks due between",
      fiveAgo.toDate().toISOString(),
      "and",
      now.toDate().toISOString()
    );

    // 2️⃣ Query for tasks due in the next minute
    const snapshot = await db
      .collection("tasks")
      .where("completed", "==", false)
      .where("dueAt", ">=", fiveAgo)
      .where("dueAt", "<", now)
      .get();

    if (snapshot.empty) {
      console.log("No tasks due in this interval");
      return;
    }

    // 3️⃣ For each due task, send an email to ownerEmail
    for (const doc of snapshot.docs) {
      const data       = doc.data();
      const ownerEmail = data.ownerEmail as string;
      const title      = data.title       as string;
      const details    = data.details     as string;

      if (!ownerEmail) {
        console.warn("Missing ownerEmail for task", doc.id);
        continue;
      }

      try {
        console.log("Sending email with payload:", {
  to: ownerEmail,
  subject: `⏰ Reminder: ${title}`,
  title,
  details: details || "No details provided.",
  name: data.ownerName || "User",
});
        console.log("Sending email for task", doc.id, "to", ownerEmail);
        console.log("Task details:", { title, details, name: data.ownerName });
        console.log("Task data:", data);
        const res = await fetch(
  "https://taskwise0.netlify.app/api/send-email",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: ownerEmail || "fallback@email.com", // replace with your email
      subject: `⏰ Reminder: ${title || "No Title"}`,
      title: title || "No Title",
      details: details || "No details provided.",
      name: data.ownerName || "User",
    }),
  }
);

        const text = await res.text();
        console.log("Email sent for task", doc.id, "response:", text);
      } catch (err: any) {
        console.error("Failed to send email for task", doc.id, "error:", err.message);
      }
    }
  },
});
