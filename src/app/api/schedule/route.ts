import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { to, subject, message } = body;

  const qstashUrl = "https://qstash.upstash.io/v1/publish/https://taskwise0.netlify.app/.netlify/functions/sendEmail";

  const res = await fetch(qstashUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, message }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("QStash error:", errorText);
    return NextResponse.json({ error: errorText }, { status: 500 });
  }

  return NextResponse.json({ message: "Scheduled email request sent to QStash" });
}
