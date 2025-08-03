import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/database"

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configured" : "❌ Missing NEXT_PUBLIC_SUPABASE_URL",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configured" : "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY",
    },
    email: {
      provider: process.env.EMAIL_PROVIDER || "Not set (will default to sendgrid)",
      sendgrid: process.env.SENDGRID_API_KEY ? "✅ Configured" : "❌ Missing SENDGRID_API_KEY",
      resend: process.env.RESEND_API_KEY ? "✅ Configured" : "❌ Missing RESEND_API_KEY",
      fromEmail: process.env.FROM_EMAIL || "Not set (will default to people@oriyali.com)",
    },
    database: null as any,
  }

  // Test database connection
  try {
    const dbCheck = await checkDatabaseConnection()
    checks.database = dbCheck.success ? "✅ Connected" : `❌ ${dbCheck.error}`
  } catch (error) {
    checks.database = `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
  }

  const allGood =
    checks.supabase.url.includes("✅") &&
    checks.supabase.anonKey.includes("✅") &&
    (checks.email.sendgrid.includes("✅") || checks.email.resend.includes("✅")) &&
    checks.database.includes("✅")

  return NextResponse.json(
    {
      status: allGood ? "healthy" : "unhealthy",
      ...checks,
    },
    {
      status: allGood ? 200 : 500,
    },
  )
}
