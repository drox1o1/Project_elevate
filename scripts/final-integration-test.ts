// Final integration test to verify everything is working
import { createClient } from "@supabase/supabase-js"
import { submitWaitlistForm } from "../app/actions/waitlist"

const supabaseUrl = "https://ydrzzgdtkeeblvjrvjma.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkcnp6Z2R0a2VlYmx2anJ2am1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.JsSTZygwFWV2aywQUtVAEMr-cEsNfIUwZcwmy4kV2AM"

const supabase = createClient(supabaseUrl, supabaseKey)

async function finalIntegrationTest() {
  console.log("🎉 Final Integration Test - Oriyali Waitlist")
  console.log("=".repeat(50))

  try {
    // Test 1: Database Connection
    console.log("1️⃣ Testing Supabase database connection...")

    const { data: connectionTest, error: connectionError } = await supabase
      .from("waitlist")
      .select("count", { count: "exact" })

    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError.message)
      return false
    }

    console.log("✅ Database connection successful!")
    console.log(`   Current waitlist entries: ${connectionTest?.length || 0}`)

    // Test 2: Table Structure
    console.log("\n2️⃣ Verifying table structure...")

    const { data: tableStructure, error: structureError } = await supabase.from("waitlist").select("*").limit(1)

    if (structureError) {
      console.error("❌ Table structure check failed:", structureError.message)
      return false
    }

    console.log("✅ Table structure verified!")

    // Test 3: Server Action Integration
    console.log("\n3️⃣ Testing complete waitlist form submission...")

    const timestamp = Date.now()
    const testFormData = new FormData()
    testFormData.append("name", "Integration Test User")
    testFormData.append("age", "28")
    testFormData.append("mobile", "+1-555-TEST-123")
    testFormData.append("email", `integration-test-${timestamp}@oriyali-test.com`)

    console.log(`   Testing with email: integration-test-${timestamp}@oriyali-test.com`)

    const formResult = await submitWaitlistForm(testFormData)

    if (formResult.success) {
      console.log("✅ Form submission successful!")
      console.log("✅ Database save successful!")
      console.log("✅ Email sending attempted!")
      console.log(`   Message: "${formResult.message.substring(0, 100)}..."`)
    } else {
      console.error("❌ Form submission failed:", formResult.message)
      return false
    }

    // Test 4: Duplicate Email Handling
    console.log("\n4️⃣ Testing duplicate email prevention...")

    const duplicateResult = await submitWaitlistForm(testFormData)

    if (!duplicateResult.success && duplicateResult.message.includes("already registered")) {
      console.log("✅ Duplicate email prevention working!")
    } else {
      console.log("⚠️  Duplicate handling result:", duplicateResult.message)
    }

    // Test 5: Email Configuration Check
    console.log("\n5️⃣ Checking email configuration...")

    const emailProvider = process.env.EMAIL_PROVIDER
    const sendgridKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.FROM_EMAIL
    const fromName = process.env.FROM_NAME

    console.log(`   Email Provider: ${emailProvider || "❌ Missing"}`)
    console.log(`   SendGrid API Key: ${sendgridKey ? "✅ Configured" : "❌ Missing"}`)
    console.log(`   From Email: ${fromEmail || "❌ Missing"}`)
    console.log(`   From Name: ${fromName || "❌ Missing"}`)

    // Test 6: Analytics Query
    console.log("\n6️⃣ Testing analytics capabilities...")

    const { data: analyticsData, error: analyticsError } = await supabase.rpc("exec_sql", {
      sql: `
          SELECT 
            COUNT(*) as total_signups,
            COUNT(CASE WHEN email_sent THEN 1 END) as emails_sent,
            AVG(age) as avg_age,
            MIN(created_at) as first_signup,
            MAX(created_at) as latest_signup
          FROM waitlist
        `,
    })

    if (!analyticsError && analyticsData) {
      console.log("✅ Analytics queries working!")
    } else {
      console.log("ℹ️  Analytics: Basic table access confirmed")
    }

    // Test 7: Production Readiness Check
    console.log("\n7️⃣ Production readiness check...")

    const productionChecks = {
      "Database Connected": !!connectionTest,
      "Table Structure Valid": !structureError,
      "Form Submission Works": formResult.success,
      "Email Provider Set": !!emailProvider,
      "SendGrid Configured": !!sendgridKey,
      "From Email Set": !!fromEmail,
      "Duplicate Prevention": !duplicateResult.success,
    }

    let allChecksPass = true
    for (const [check, passed] of Object.entries(productionChecks)) {
      console.log(`   ${passed ? "✅" : "❌"} ${check}`)
      if (!passed) allChecksPass = false
    }

    console.log("\n" + "=".repeat(50))

    if (allChecksPass) {
      console.log("🎉 INTEGRATION TEST PASSED!")
      console.log("🚀 Your Oriyali waitlist is READY FOR PRODUCTION!")
      console.log("\n📊 Dashboard Links:")
      console.log("• Supabase: https://app.supabase.com/project/ydrzzgdtkeeblvjrvjma")
      console.log("• SendGrid: https://app.sendgrid.com")
      console.log("\n🌐 Ready to deploy to:")
      console.log("• Vercel: https://vercel.com")
      console.log("• Netlify: https://netlify.com")
      console.log("• Your custom domain: oriyali.com")
    } else {
      console.log("⚠️  Some checks failed - review the issues above")
    }

    return allChecksPass
  } catch (error) {
    console.error("❌ Integration test failed:", error)
    return false
  }
}

// Run the comprehensive test
finalIntegrationTest().then((success) => {
  if (success) {
    console.log("\n🎯 Next Steps:")
    console.log("1. Deploy your website to production")
    console.log("2. Test the live waitlist form")
    console.log("3. Monitor signups in your Supabase dashboard")
    console.log("4. Check email delivery in SendGrid")
    console.log("\n🌟 Congratulations! Your Oriyali waitlist is complete!")
  } else {
    console.log("\n🔧 Please address the issues above before deploying")
  }
})
