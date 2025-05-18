// src/app/api/send-email/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse and log incoming body
    const body = await req.json();
    const { to, subject, title, details, name } = body;
    console.log("📥 Received sendEmail request:", { to, subject, title, details, name });

    // Collect missing required fields
    const required = { to, subject, title };
    const missing = Object.entries(required)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`,
          received: { to, subject, title },
        },
        { status: 400 }
      );
    }

    // Ensure API key is present
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("❌ BREVO_API_KEY not set");
      return NextResponse.json(
        { success: false, error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Call Brevo
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "TaskWise", email: "taskwise3@gmail.com" },
        to: [{ email: to, name: name || "User" }],
        subject,
        templateId: 1,
        params: {
          name: name ?? "there",
          title,
          details: details ?? "",
        },
      }),
    });

    const brevoData = await brevoRes.json();
    if (!brevoRes.ok) {
      console.error("❌ Brevo API error:", brevoData);
      return NextResponse.json(
        { success: false, error: brevoData },
        { status: 502 }
      );
    }

    console.log("✅ Email queued successfully:", brevoData);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("🔥 Unexpected error in sendEmail:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
