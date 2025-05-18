import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, subject, title, details, name } = await req.json();

    // ✅ Validate required fields
    if (!to || !subject || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    const templateId = 1; // Make sure this is your actual Brevo template ID

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
          details: details || "No details provided.",
        },
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      console.error("Brevo API error:", data);
      return NextResponse.json({ success: false, error: data }, { status: 500 });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
