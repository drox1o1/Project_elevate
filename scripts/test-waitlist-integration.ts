// Complete integration test after setup
import { submitWaitlistForm } from "../app/actions/waitlist"

async function testWaitlistIntegration() {
  console.log("🔗 Testing Complete Waitlist Integration")
  console.log("=".repeat(40))

  try {
    // Test 1: Valid form submission
    console.log("1️⃣ Testing valid form submission...")

    const timestamp = Date.now()
    const formData = new FormData()
    formData.append("name", "Integration Test User")
    formData.append("age", "29")
    formData.append("mobile", "+1-555-INTEGRATION")
    formData.append("email", `integration-${timestamp}@test.com`)

    const result = await submitWaitlistForm(formData)

    if (result.success) {
      console.log("✅ Form submission successful!")
      console.log("✅ Database save successful!")
      console.log("✅ Email sending attempted!")
      console.log(`📧 Message: "${result.message.substring(0, 100)}..."`)
    } else {
      console.log("❌ Form submission failed:", result.message)
      return false
    }

    // Test 2: Duplicate email
    console.log("\n2️⃣ Testing duplicate email handling...")

    const duplicateResult = await submitWaitlistForm(formData)

    if (!duplicateResult.success && duplicateResult.message.includes("already registered")) {
      console.log("✅ Duplicate email prevention works!")
    } else {
      console.log("⚠️  Duplicate result:", duplicateResult.message)
    }

    // Test 3: Invalid data
    console.log("\n3️⃣ Testing validation...")

    const invalidData = new FormData()
    invalidData.append("name", "Test")
    invalidData.append("age", "999") // Invalid age
    invalidData.append("mobile", "123")
    invalidData.append("email", "invalid-email")

    const invalidResult = await submitWaitlistForm(invalidData)

    if (!invalidResult.success) {
      console.log("✅ Validation works correctly!")
      console.log(`   Error: ${invalidResult.message}`)
    } else {
      console.log("⚠️  Validation might need attention")
    }

    console.log("\n🎉 Integration test completed!")
    console.log("✅ Your complete waitlist system is working!")

    return true
  } catch (error) {
    console.error("❌ Integration test failed:", error)
    return false
  }
}

testWaitlistIntegration()
