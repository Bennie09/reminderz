import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, name } = body;

    if (!to) {
      return NextResponse.json({ success: false, error: "Missing 'to' field" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Server misconfiguration" }, { status: 500 });
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "TaskWise", email: "taskwise3@gmail.com" },
        to: [{ email: to, name: name || "User" }],
        subject: " 🎉 Welcome to TaskWise! 🎉",
        templateId: 2,
        params: {
          name: name ?? "there"
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Brevo error:", data);
      return NextResponse.json({ success: false, error: data }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
