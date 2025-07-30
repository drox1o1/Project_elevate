// Test script to simulate waitlist form submission
import { submitWaitlistForm } from "../app/actions/waitlist"

async function testWaitlistForm() {
  console.log("🧪 Testing Waitlist Form Submission")
  console.log("=".repeat(40))

  try {
    // Create test form data
    const formData = new FormData()
    formData.append("name", "Jane Doe")
    formData.append("age", "29")
    formData.append("mobile", "+1-555-123-4567")
    formData.append("email", `test-${Date.now()}@example.com`)

    console.log("📝 Submitting test form data...")
    console.log("   Name: Jane Doe")
    console.log("   Age: 29")
    console.log("   Mobile: +1-555-123-4567")
    console.log(`   Email: test-${Date.now()}@example.com`)

    // Submit the form
    const result = await submitWaitlistForm(formData)

    if (result.success) {
      console.log("\n✅ Form submission successful!")
      console.log("   Message:", result.message)
      console.log("\n📧 Check your email system for welcome email delivery")
      console.log("📊 Check your Supabase dashboard for the new entry")
    } else {
      console.log("\n❌ Form submission failed!")
      console.log("   Error:", result.message)
    }

    // Test duplicate email
    console.log("\n🔄 Testing duplicate email handling...")
    const duplicateResult = await submitWaitlistForm(formData)

    if (!duplicateResult.success && duplicateResult.message.includes("already registered")) {
      console.log("✅ Duplicate email handling works correctly!")
    } else {
      console.log("⚠️  Duplicate email handling may need attention")
    }
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testWaitlistForm()
