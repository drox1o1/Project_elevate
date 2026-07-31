import { NextRequest, NextResponse } from "next/server";

/**
 * Reference submissions for Pop Indices.
 *
 * Readers suggest a scene; editorial decides whether it clears the
 * qualification framework (recognition, specificity, data availability,
 * economic meaning, narrative contrast). There is deliberately no public
 * comment feed in the first release, so this is a one-way queue.
 *
 * Storage: forwarded to DUKU_POP_INDICES_WEBHOOK when set, logged server-side
 * otherwise. Wire the env var before launch.
 */

interface Submission {
  reference: string;
  measurable: string;
  email?: string;
}

const MAX = { reference: 300, measurable: 1000, email: 200 } as const;

export async function POST(req: NextRequest) {
  let body: Partial<Submission>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const reference = String(body.reference ?? "").trim();
  const measurable = String(body.measurable ?? "").trim();
  const email = body.email ? String(body.email).trim() : undefined;

  if (reference.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Which scene? A film and a line is enough." },
      { status: 400 }
    );
  }
  if (measurable.length < 3) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Name the measurable thing — an object, a quantity or a transaction.",
      },
      { status: 400 }
    );
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email does not look right." },
      { status: 400 }
    );
  }

  const submission = {
    reference: reference.slice(0, MAX.reference),
    measurable: measurable.slice(0, MAX.measurable),
    ...(email ? { email: email.slice(0, MAX.email) } : {}),
    at: new Date().toISOString(),
    source: "labs.duku.design/pop-indices",
  };

  const webhook = process.env.DUKU_POP_INDICES_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
    } catch (err) {
      // Don't lose the suggestion because the webhook hiccuped.
      console.error("[pop-indices] webhook forward failed:", err);
    }
  }
  console.log("[pop-indices]", JSON.stringify(submission));

  return NextResponse.json({ ok: true });
}
