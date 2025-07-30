// Resend Email Provider Implementation
import type { EmailProvider, EmailParams, EmailResult } from "../email-service"

export class ResendEmailService implements EmailProvider {
  private resend: any
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey

    try {
      const { Resend } = require("resend")
      this.resend = new Resend(apiKey)
    } catch (error) {
      console.error("Resend package not installed. Run: npm install resend")
      throw new Error("Resend package not found")
    }
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      if (!this.apiKey) {
        throw new Error("RESEND_API_KEY environment variable is required")
      }

      const result = await this.resend.emails.send({
        from: `${params.fromName} <${params.from}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        // Optional: Add tags for tracking
        tags: [
          { name: "category", value: "waitlist" },
          { name: "source", value: "oriyali-website" },
        ],
      })

      if (result.error) {
        return {
          success: false,
          error: result.error.message || "Failed to send email",
        }
      }

      return {
        success: true,
        messageId: result.data?.id,
      }
    } catch (error) {
      console.error("Resend email error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Test email functionality
  async testConnection(): Promise<boolean> {
    try {
      // Send a test email to verify configuration
      const testResult = await this.sendEmail({
        to: "test@resend.dev", // Resend's test email
        from: "onboarding@resend.dev",
        fromName: "Oriyali Test",
        subject: "Test Email Configuration",
        html: "<p>This is a test email to verify Resend configuration.</p>",
        text: "This is a test email to verify Resend configuration.",
      })

      return testResult.success
    } catch (error) {
      console.error("Resend connection test failed:", error)
      return false
    }
  }
}
