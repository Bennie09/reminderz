import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { to, subject, message, sendAt } = body;

  if (!to || !subject || !message || !sendAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const qstashToken = process.env.NEXT_PUBLIC_QSTASH_TOKEN;

    const delayInMs = new Date(sendAt).getTime() - Date.now();
    if (delayInMs < 0) {
      return NextResponse.json({ error: "Cannot schedule in the past" }, { status: 400 });
    }

    const res = await fetch("https://qstash.upstash.io/v1/publish/https://taskwise0.netlify.app/.netlify/functions/sendEmail", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${qstashToken}`,
        "Content-Type": "application/json",
        "Upstash-Delay": `${delayInMs}ms`,
      },
      body: JSON.stringify({ to, subject, message }),
    });

    const result = await res.text();
    return NextResponse.json({ status: res.status, result });
  } catch (err: unknown) {
    console.error("QStash publish error:", err);
    return NextResponse.json({ error: "Failed to schedule email" }, { status: 500 });
  }
}
