import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { to, subject, title, details, name } = await req.json();

  const apiKey = process.env.BREVO_API_KEY;
  const templateId = 1; // ✅ This is your actual Brevo template ID

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey!,
    },
    body: JSON.stringify({
      sender: { name: "TaskWise", email: "taskwise3@gmail.com" },
      to: [{ email: to, name: name || "User" }],
      subject,
      templateId,
      params: {
        name,
        title,
        details,
      },
    }),
  });

  const data = await res.json();

  if (res.ok) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: data }, { status: 500 });
  }
}
