// Debug script to identify the server action issue
import { submitWaitlistForm } from "../app/actions/waitlist"

async function debugServerAction() {
  console.log("🔍 Debugging Server Action Issue")
  console.log("=".repeat(40))

  try {
    // Check environment variables first
    console.log("1️⃣ Checking environment variables...")

    const envVars = {
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      FROM_EMAIL: process.env.FROM_EMAIL,
      FROM_NAME: process.env.FROM_NAME,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    for (const [key, value] of Object.entries(envVars)) {
      console.log(`   ${key}: ${value ? "✅ Set" : "❌ Missing"}`)
    }

    // Test basic imports
    console.log("\n2️⃣ Testing imports...")

    try {
      const { createClient } = require("@supabase/supabase-js")
      console.log("✅ Supabase import successful")
    } catch (error) {
      console.error("❌ Supabase import failed:", error.message)
      return
    }

    try {
      const sgMail = require("@sendgrid/mail")
      console.log("✅ SendGrid import successful")
    } catch (error) {
      console.error("❌ SendGrid import failed:", error.message)
      return
    }

    // Test form submission with detailed error handling
    console.log("\n3️⃣ Testing form submission...")

    const testFormData = new FormData()
    testFormData.append("name", "Debug Test User")
    testFormData.append("age", "25")
    testFormData.append("mobile", "+1234567890")
    testFormData.append("email", `debug-${Date.now()}@test.com`)

    console.log("   Submitting test form...")

    const result = await submitWaitlistForm(testFormData)

    if (result.success) {
      console.log("✅ Server action working correctly!")
      console.log("   Message:", result.message)
    } else {
      console.error("❌ Server action failed:", result.message)
    }
  } catch (error) {
    console.error("❌ Debug script error:", error)
    console.error("Stack trace:", error.stack)
  }
}

debugServerAction()
