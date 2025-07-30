// Test the complete waitlist flow: form submission + email
import { submitWaitlistForm } from "../app/actions/waitlist"

async function testCompleteFlow() {
  console.log("🧪 Testing Complete Waitlist Flow")
  console.log("=".repeat(40))

  try {
    // Create realistic test data
    const timestamp = Date.now()
    const testData = {
      name: "Sarah Johnson",
      age: "32",
      mobile: "+1-555-987-6543",
      email: `sarah.test.${timestamp}@example.com`,
    }

    console.log("📝 Testing with realistic data:")
    console.log(`   Name: ${testData.name}`)
    console.log(`   Age: ${testData.age}`)
    console.log(`   Mobile: ${testData.mobile}`)
    console.log(`   Email: ${testData.email}`)

    // Create FormData (simulating form submission)
    const formData = new FormData()
    formData.append("name", testData.name)
    formData.append("age", testData.age)
    formData.append("mobile", testData.mobile)
    formData.append("email", testData.email)

    console.log("\n🔄 Submitting form...")

    // Test the actual server action
    const result = await submitWaitlistForm(formData)

    if (result.success) {
      console.log("✅ Form submission successful!")
      console.log("📧 Welcome email should be sent")
      console.log("💾 Data saved to Supabase")
      console.log("\n📋 Response message:")
      console.log(`"${result.message}"`)

      // Test duplicate submission
      console.log("\n🔄 Testing duplicate email handling...")
      const duplicateResult = await submitWaitlistForm(formData)

      if (!duplicateResult.success && duplicateResult.message.includes("already registered")) {
        console.log("✅ Duplicate email handling works correctly!")
      } else {
        console.log("⚠️  Duplicate handling result:", duplicateResult.message)
      }
    } else {
      console.log("❌ Form submission failed!")
      console.log("Error:", result.message)
    }

    // Test validation errors
    console.log("\n🧪 Testing form validation...")

    // Test invalid email
    const invalidEmailData = new FormData()
    invalidEmailData.append("name", "Test User")
    invalidEmailData.append("age", "25")
    invalidEmailData.append("mobile", "+1234567890")
    invalidEmailData.append("email", "invalid-email")

    const invalidResult = await submitWaitlistForm(invalidEmailData)

    if (!invalidResult.success && invalidResult.message.includes("valid email")) {
      console.log("✅ Email validation works correctly!")
    } else {
      console.log("⚠️  Email validation result:", invalidResult.message)
    }

    // Test invalid age
    const invalidAgeData = new FormData()
    invalidAgeData.append("name", "Test User")
    invalidAgeData.append("age", "150") // Invalid age
    invalidAgeData.append("mobile", "+1234567890")
    invalidAgeData.append("email", "test@example.com")

    const ageResult = await submitWaitlistForm(invalidAgeData)

    if (!ageResult.success && ageResult.message.includes("valid age")) {
      console.log("✅ Age validation works correctly!")
    } else {
      console.log("⚠️  Age validation result:", ageResult.message)
    }

    console.log("\n🎉 Complete flow test finished!")
    console.log("\n📊 Check your:")
    console.log("• Supabase dashboard for the new entry")
    console.log("• SendGrid dashboard for email delivery")
    console.log("• Email inbox for the welcome message")
  } catch (error) {
    console.error("❌ Complete flow test failed:", error)
  }
}

testCompleteFlow()
