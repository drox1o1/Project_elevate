import { NextRequest, NextResponse } from "next/server";

/**
 * Lead capture for the free-access form. Components stay free to
 * integrate; this is the lead magnet that tells us who's building what.
 *
 * Storage: if DUKU_LEADS_WEBHOOK is set (e.g. a Slack webhook, Airtable
 * automation or CRM endpoint), the lead is forwarded there as JSON.
 * Without it the lead is logged server-side only — wire the env var
 * before launch.
 */

interface Lead {
  email: string;
  building: string;
  purposes: string[];
  role?: string;
}

export async function POST(req: NextRequest) {
  let body: Partial<Lead>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const building = String(body.building ?? "").trim();
  const purposes = Array.isArray(body.purposes)
    ? body.purposes.map(String).slice(0, 10)
    : [];
  const role = body.role ? String(body.role).trim().slice(0, 120) : undefined;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email." },
      { status: 400 }
    );
  }
  if (building.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Tell us a little about what you're building." },
      { status: 400 }
    );
  }

  const lead: Lead & { at: string; source: string } = {
    email,
    building: building.slice(0, 2000),
    purposes,
    ...(role ? { role } : {}),
    at: new Date().toISOString(),
    source: "labs.duku.design/#access",
  };

  const webhook = process.env.DUKU_LEADS_WEBHOOK;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      // Don't lose the signup because the webhook hiccuped.
      console.error("[leads] webhook forward failed:", err);
    }
  }
  console.log("[leads]", JSON.stringify(lead));

  return NextResponse.json({ ok: true });
}
