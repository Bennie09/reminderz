import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { to, subject, title, details } = await req.json();

  const apiKey = process.env.BREVO_API_KEY;

  const htmlContent = `
    <div style="background: #f9fafb; padding: 20px; font-family: sans-serif; color: #111827;">
      <!-- Header with logo and title -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <img src="https://taskwise0.netlify.app/assets/tasks.png" alt="TaskWise Logo" width="40" height="40" style="border-radius: 4px;" />
        <h1 style="margin: 0; font-size: 24px; color: #0F95FF;">TaskWise</h1>
      </div>

      <!-- Reminder content -->
      <p style="font-size: 16px;">Your task <strong>"${title}"</strong> is due!</p>
      <p style="margin: 20px 0; background: #fff3cd; padding: 10px; border-radius: 6px;">
        <strong>Details:</strong><br />
        ${details || "No details provided."}
      </p>

      <!-- Footer -->
      <p style="font-size: 13px; color: #6b7280; margin-top: 30px;">
        You received this reminder from <strong>TaskWise</strong>.<br />
        <span style="font-size: 11px; display: block; margin-top: 10px;">Copyright © of Xvoid Technologies</span>
      </p>
    </div>
  `;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey!,
    },
    body: JSON.stringify({
      sender: { name: "Reminderz", email: "taskwise3@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: data }, { status: 500 });
  }
}
