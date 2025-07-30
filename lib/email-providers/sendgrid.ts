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
      console.log("✅ SendGrid initialized successfully")
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
        from: params.from, // Use simple string format for verified sender
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

      return {
        success: true,
        messageId: result[0].headers["x-message-id"] || "sent",
      }
    } catch (error: any) {
      console.error("❌ SendGrid email error:", error)

      let errorMessage = "Failed to send email"
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

  async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 Testing SendGrid connection...")

      // Test with sandbox mode
      const result = await this.sgMail.send({
        to: "test@example.com",
        from: process.env.FROM_EMAIL || "people@oriyali.com",
        subject: "Connection Test",
        text: "This is a connection test",
        html: "<p>This is a connection test</p>",
        mailSettings: {
          sandboxMode: {
            enable: true,
          },
        },
      })

      console.log("✅ SendGrid connection test successful")
      return true
    } catch (error: any) {
      console.error("❌ SendGrid connection test failed:", error)
      return false
    }
  }
}
