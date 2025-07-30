// Updated Email service with provider factory
import { ResendEmailService } from "./email-providers/resend"
import { SendGridEmailService } from "./email-providers/sendgrid"

export interface EmailProvider {
  sendEmail(params: EmailParams): Promise<EmailResult>
  testConnection?(): Promise<boolean>
}

export interface EmailParams {
  to: string
  from: string
  fromName: string
  subject: string
  html: string
  text: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Factory function to create email service
export function createEmailService(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || "resend"

  console.log(`🔧 Initializing ${provider} email service...`)

  switch (provider.toLowerCase()) {
    case "resend":
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) {
        throw new Error("RESEND_API_KEY environment variable is required when using Resend")
      }
      return new ResendEmailService(resendKey)

    case "sendgrid":
      const sendgridKey = process.env.SENDGRID_API_KEY
      if (!sendgridKey) {
        throw new Error("SENDGRID_API_KEY environment variable is required when using SendGrid")
      }
      return new SendGridEmailService(sendgridKey)

    default:
      throw new Error(`Unsupported email provider: ${provider}. Supported providers: resend, sendgrid`)
  }
}

// Test email service configuration
export async function testEmailService(): Promise<{ success: boolean; provider: string; error?: string }> {
  try {
    const emailService = createEmailService()
    const provider = process.env.EMAIL_PROVIDER || "resend"

    if (emailService.testConnection) {
      const isConnected = await emailService.testConnection()
      return {
        success: isConnected,
        provider,
        error: isConnected ? undefined : "Connection test failed",
      }
    }

    return { success: true, provider }
  } catch (error) {
    return {
      success: false,
      provider: process.env.EMAIL_PROVIDER || "unknown",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
