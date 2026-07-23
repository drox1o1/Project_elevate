import { NextRequest, NextResponse } from "next/server";

/**
 * Identify capture for DUKU Labs.
 *
 * DUKU Labs is MIT-licensed and fully open source — every component and the
 * MCP server are free with no key or paywall. Before we hand a visitor the
 * MCP connection or a component install command we ask who they are: their
 * email, their company and their role (owner, designer, developer, …). It
 * lets us understand who is building on the system and what to build next.
 *
 * Storage: if DUKU_LEADS_WEBHOOK is set (e.g. a Slack webhook, Airtable
 * automation or CRM endpoint), the record is forwarded there as JSON.
 * Without it the record is logged server-side only — wire the env var
 * before launch.
 */

const ROLES = [
  "Owner",
  "Founder",
  "Designer",
  "Developer",
  "Product manager",
  "Engineering lead",
  "Student",
  "Other",
];

interface Lead {
  email: string;
  company: string;
  role: string;
  building?: string;
  purposes?: string[];
  // What the visitor was reaching for when the gate appeared.
  intent?: string;
}

export async function POST(req: NextRequest) {
  let body: Partial<Lead>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const role = String(body.role ?? "").trim();
  const building = String(body.building ?? "").trim();
  const purposes = Array.isArray(body.purposes)
    ? body.purposes.map(String).slice(0, 10)
    : [];
  const intent = body.intent ? String(body.intent).trim().slice(0, 60) : undefined;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email." },
      { status: 400 }
    );
  }
  if (company.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Tell us your company or project name." },
      { status: 400 }
    );
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json(
      { ok: false, error: "Select your role." },
      { status: 400 }
    );
  }

  const lead: Lead & { at: string; source: string } = {
    email,
    company: company.slice(0, 200),
    role,
    ...(building ? { building: building.slice(0, 2000) } : {}),
    ...(purposes.length ? { purposes } : {}),
    ...(intent ? { intent } : {}),
    at: new Date().toISOString(),
    source: "labs.duku.design",
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
