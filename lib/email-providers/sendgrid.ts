// SendGrid Email Provider Implementation
import type { EmailProvider, EmailParams, EmailResult } from "../email-service"

export class SendGridEmailService implements EmailProvider {
  private sgMail: any
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey

    try {
      this.sgMail = require("@sendgrid/mail")
      this.sgMail.setApiKey(apiKey)
      console.log("✅ SendGrid initialized with API key: SG.o-wul6T...")
    } catch (error) {
      console.error("❌ SendGrid package not installed. Run: npm install @sendgrid/mail")
      throw new Error("SendGrid package not found")
    }
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      if (!this.apiKey) {
        throw new Error("SENDGRID_API_KEY environment variable is required")
      }

      console.log(`📧 Sending email via SendGrid to: ${params.to}`)

      const msg = {
        to: params.to,
        from: {
          email: params.from,
          name: params.fromName,
        },
        subject: params.subject,
        text: params.text,
        html: params.html,
        // Add categories for tracking
        categories: ["waitlist", "oriyali-website"],
        // Add custom args for analytics
        customArgs: {
          source: "waitlist-signup",
          version: "v1",
          timestamp: new Date().toISOString(),
        },
        // Add tracking settings
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: false,
          },
          openTracking: {
            enable: true,
          },
        },
      }

      const result = await this.sgMail.send(msg)

      console.log(`✅ Email sent successfully via SendGrid`)
      console.log(`   Message ID: ${result[0].headers["x-message-id"]}`)

      return {
        success: true,
        messageId: result[0].headers["x-message-id"],
      }
    } catch (error: any) {
      console.error("❌ SendGrid email error:", error)

      let errorMessage = "Unknown error occurred"
      if (error.response?.body?.errors) {
        errorMessage = error.response.body.errors.map((e: any) => e.message).join(", ")
        console.error("SendGrid API errors:", error.response.body.errors)
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  // Test email functionality
  async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 Testing SendGrid connection...")

      // Test with sandbox mode to avoid sending actual email
      const result = await this.sgMail.send({
        to: "test@example.com",
        from: {
          email: "people@oriyali.com",
          name: "Oriyali",
        },
        subject: "Connection Test",
        text: "This is a connection test",
        html: "<p>This is a connection test</p>",
        mailSettings: {
          sandboxMode: {
            enable: true, // This prevents actual email sending
          },
        },
      })

      console.log("✅ SendGrid connection test successful")
      return true
    } catch (error: any) {
      console.error("❌ SendGrid connection test failed:", error)

      if (error.response?.body?.errors) {
        console.error("API errors:", error.response.body.errors)
      }

      return false
    }
  }
}
