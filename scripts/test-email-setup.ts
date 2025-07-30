// Test script to verify email configuration
import { testEmailService, createEmailService } from "../lib/email-service"

async function testEmailSetup() {
  console.log("🧪 Testing Email Service Configuration...")
  console.log("=".repeat(50))

  try {
    // Test service creation
    console.log("1️⃣ Testing service initialization...")
    const emailService = createEmailService()
    console.log("✅ Email service created successfully")

    // Test connection
    console.log("\n2️⃣ Testing connection...")
    const connectionTest = await testEmailService()

    if (connectionTest.success) {
      console.log(`✅ ${connectionTest.provider} connection successful`)
    } else {
      console.log(`❌ ${connectionTest.provider} connection failed: ${connectionTest.error}`)
      return
    }

    // Test sending email (to a test address)
    console.log("\n3️⃣ Testing email sending...")
    const testEmail = {
      to: "test@resend.dev", // Use your test email
      from: process.env.FROM_EMAIL || "hello@oriyali.com",
      fromName: process.env.FROM_NAME || "Oriyali Team",
      subject: "Test Email - Oriyali Setup",
      html: "<h1>Test Email</h1><p>If you receive this, your email setup is working!</p>",
      text: "Test Email - If you receive this, your email setup is working!",
    }

    const result = await emailService.sendEmail(testEmail)

    if (result.success) {
      console.log(`✅ Test email sent successfully (ID: ${result.messageId})`)
    } else {
      console.log(`❌ Test email failed: ${result.error}`)
    }

    console.log("\n🎉 Email setup test completed!")
  } catch (error) {
    console.error("❌ Email setup test failed:", error)
    console.log("\n💡 Common issues:")
    console.log("- Check your API key is correct")
    console.log("- Verify your domain is configured")
    console.log("- Ensure environment variables are set")
  }
}

// Run the test
testEmailSetup()
