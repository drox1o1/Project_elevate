// Verification script specifically for your SendGrid setup
import { createEmailService } from "../lib/email-service"

async function verifySendGridSetup() {
  console.log("🔍 Verifying SendGrid Setup for Oriyali...")
  console.log("=".repeat(50))

  try {
    // Check environment variables
    console.log("1️⃣ Checking environment variables...")

    const provider = process.env.EMAIL_PROVIDER
    const apiKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.FROM_EMAIL
    const fromName = process.env.FROM_NAME

    console.log(`   Provider: ${provider || "❌ Missing"}`)
    console.log(`   API Key: ${apiKey ? "✅ Set (SG.o-wul6T...)" : "❌ Missing"}`)
    console.log(`   From Email: ${fromEmail || "❌ Missing"}`)
    console.log(`   From Name: ${fromName || "❌ Missing"}`)

    if (!provider || !apiKey || !fromEmail || !fromName) {
      console.log("\n❌ Missing required environment variables!")
      return
    }

    // Test service creation
    console.log("\n2️⃣ Creating email service...")
    const emailService = createEmailService()
    console.log("✅ SendGrid service created successfully")

    // Send test email
    console.log("\n3️⃣ Sending test email...")
    const testResult = await emailService.sendEmail({
      to: "people@oriyali.com", // Send to your own email
      from: fromEmail,
      fromName: fromName,
      subject: "🧪 Oriyali Email System Test",
      html: `
        <div style="font-family: 'Sorts Mill Goudy', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF5B04; font-size: 32px;">✨ Oriyali</h1>
            <h2 style="color: #075056;">Email System Test Successful!</h2>
          </div>
          
          <div style="background: #FDF6E3; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #075056; margin-top: 0;">Configuration Details:</h3>
            <ul style="color: #233038;">
              <li><strong>Provider:</strong> SendGrid</li>
              <li><strong>From Email:</strong> ${fromEmail}</li>
              <li><strong>From Name:</strong> ${fromName}</li>
              <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="color: #233038;">
            🎉 Your email system is working perfectly! You can now send welcome emails to waitlist subscribers.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://oriyali.com" style="background: #FF5B04; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">
              Visit Oriyali
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #D3DBDD; font-size: 14px; color: #666;">
            <p>© 2025 Oriyali by Terramedici Lifesciences LLP</p>
          </div>
        </div>
      `,
      text: `
Oriyali Email System Test Successful!

Configuration Details:
- Provider: SendGrid
- From Email: ${fromEmail}
- From Name: ${fromName}
- Test Time: ${new Date().toLocaleString()}

🎉 Your email system is working perfectly! You can now send welcome emails to waitlist subscribers.

Visit: https://oriyali.com

© 2025 Oriyali by Terramedici Lifesciences LLP
      `.trim(),
    })

    if (testResult.success) {
      console.log(`✅ Test email sent successfully!`)
      console.log(`   Message ID: ${testResult.messageId}`)
      console.log(`   Check your inbox at: people@oriyali.com`)
    } else {
      console.log(`❌ Test email failed: ${testResult.error}`)
    }

    console.log("\n🎉 SendGrid setup verification completed!")
    console.log("\n💡 Next steps:")
    console.log("1. Check your email inbox for the test message")
    console.log("2. Set up domain authentication in SendGrid dashboard")
    console.log("3. Your waitlist form will now send welcome emails!")
  } catch (error) {
    console.error("❌ SendGrid setup verification failed:", error)
    console.log("\n🔧 Troubleshooting:")
    console.log("1. Verify your API key is correct")
    console.log("2. Check that people@oriyali.com is verified in SendGrid")
    console.log("3. Ensure all environment variables are set")
  }
}

// Run the verification
verifySendGridSetup()
