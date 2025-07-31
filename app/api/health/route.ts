import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { testEmailService } from "@/lib/email-service"

export async function GET() {
  try {
    console.log("🔍 Health check starting...")

    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "sendgrid",
      SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    }

    console.log("📋 Environment variables:", envCheck)

    // Test database connection
    const dbStatus = { connected: false, error: null, tableExists: false }
    try {
      const { data, error } = await supabaseAdmin.from("waitlist").select("count", { count: "exact" }).limit(1)

      if (error) {
        dbStatus.error = error.message
        dbStatus.tableExists = error.code !== "PGRST116"
      } else {
        dbStatus.connected = true
        dbStatus.tableExists = true
      }
    } catch (error) {
      dbStatus.error = error instanceof Error ? error.message : "Unknown database error"
    }

    console.log("💾 Database status:", dbStatus)

    // Test email service
    let emailStatus = { configured: false, error: null, provider: "none" }
    try {
      const emailTest = await testEmailService()
      emailStatus = {
        configured: emailTest.success,
        error: emailTest.error || null,
        provider: emailTest.provider,
      }
    } catch (error) {
      emailStatus.error = error instanceof Error ? error.message : "Unknown email error"
    }

    console.log("📧 Email status:", emailStatus)

    const healthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbStatus,
      email: emailStatus,
      ready: dbStatus.connected && dbStatus.tableExists,
    }

    console.log("✅ Health check completed:", healthStatus)

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("❌ Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
