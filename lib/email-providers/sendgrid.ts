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
    } catch (error) {
      console.error("SendGrid package not installed. Run: npm install @sendgrid/mail")
      throw new Error("SendGrid package not found")
    }
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      if (!this.apiKey) {
        throw new Error("SENDGRID_API_KEY environment variable is required")
      }

      const msg = {
        to: params.to,
        from: {
          email: params.from,
          name: params.fromName,
        },
        subject: params.subject,
        text: params.text,
        html: params.html,
        // Optional: Add categories for tracking
        categories: ["waitlist", "oriyali-website"],
        // Optional: Add custom args for analytics
        customArgs: {
          source: "waitlist-signup",
          version: "v1",
        },
      }

      const result = await this.sgMail.send(msg)

      return {
        success: true,
        messageId: result[0].headers["x-message-id"],
      }
    } catch (error: any) {
      console.error("SendGrid email error:", error)

      let errorMessage = "Unknown error occurred"
      if (error.response?.body?.errors) {
        errorMessage = error.response.body.errors.map((e: any) => e.message).join(", ")
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
      // SendGrid doesn't have a specific test endpoint, so we'll validate the API key
      const result = await this.sgMail.send({
        to: "test@example.com",
        from: "test@example.com",
        subject: "Test",
        text: "Test",
        mailSettings: {
          sandboxMode: {
            enable: true, // This prevents actual email sending
          },
        },
      })

      return true
    } catch (error) {
      console.error("SendGrid connection test failed:", error)
      return false
    }
  }
}
