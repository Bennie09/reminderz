import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { to, subject, htmlContent } = await req.json();

  const apiKey = process.env.BREVO_API_KEY;

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
