// Combined script to run setup and test
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function runSetupAndTest() {
  console.log("🚀 Running Supabase Waitlist Setup and Test")
  console.log("=".repeat(50))

  try {
    // First, run the setup
    console.log("1️⃣ Running Supabase setup...")
    console.log("Command: npx tsx scripts/setup-supabase-waitlist.ts")

    const { stdout: setupOutput, stderr: setupError } = await execAsync("npx tsx scripts/setup-supabase-waitlist.ts")

    if (setupError) {
      console.error("Setup stderr:", setupError)
    }

    console.log("Setup output:")
    console.log(setupOutput)

    // Wait a moment before testing
    console.log("\n⏳ Waiting 2 seconds before testing...")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Then run the test
    console.log("\n2️⃣ Running waitlist form test...")
    console.log("Command: npx tsx scripts/test-waitlist-form.ts")

    const { stdout: testOutput, stderr: testError } = await execAsync("npx tsx scripts/test-waitlist-form.ts")

    if (testError) {
      console.error("Test stderr:", testError)
    }

    console.log("Test output:")
    console.log(testOutput)

    console.log("\n🎉 Setup and test completed!")
  } catch (error) {
    console.error("❌ Error running scripts:", error)

    // Try to run them individually with more detailed error handling
    console.log("\n🔧 Trying individual execution...")

    try {
      console.log("\n📋 Checking environment variables...")
      console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
      console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
      console.log("EMAIL_PROVIDER:", process.env.EMAIL_PROVIDER ? "✅ Set" : "❌ Missing")
      console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ Set" : "❌ Missing")
    } catch (envError) {
      console.error("Error checking environment:", envError)
    }
  }
}

runSetupAndTest()
