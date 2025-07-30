// Email service integration for production use
// Choose one of these services and configure accordingly

export interface EmailProvider {
  sendEmail(params: EmailParams): Promise<EmailResult>
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

// Resend Email Service (Recommended)
export class ResendEmailService implements EmailProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      // Uncomment and install resend package: npm install resend
      // const { Resend } = require('resend')
      // const resend = new Resend(this.apiKey)

      // const result = await resend.emails.send({
      //   from: `${params.fromName} <${params.from}>`,
      //   to: params.to,
      //   subject: params.subject,
      //   html: params.html,
      //   text: params.text,
      // })

      // return {
      //   success: true,
      //   messageId: result.data?.id,
      // }

      // Mock implementation for now
      console.log("Mock: Sending email via Resend", params.to)
      return { success: true, messageId: "mock-id" }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// SendGrid Email Service (Alternative)
export class SendGridEmailService implements EmailProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      // Uncomment and install sendgrid package: npm install @sendgrid/mail
      // const sgMail = require('@sendgrid/mail')
      // sgMail.setApiKey(this.apiKey)

      // const msg = {
      //   to: params.to,
      //   from: {
      //     email: params.from,
      //     name: params.fromName,
      //   },
      //   subject: params.subject,
      //   text: params.text,
      //   html: params.html,
      // }

      // const result = await sgMail.send(msg)
      // return {
      //   success: true,
      //   messageId: result[0].headers['x-message-id'],
      // }

      // Mock implementation for now
      console.log("Mock: Sending email via SendGrid", params.to)
      return { success: true, messageId: "mock-id" }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Factory function to create email service
export function createEmailService(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || "resend"

  switch (provider) {
    case "resend":
      return new ResendEmailService(process.env.RESEND_API_KEY || "")
    case "sendgrid":
      return new SendGridEmailService(process.env.SENDGRID_API_KEY || "")
    default:
      throw new Error(`Unsupported email provider: ${provider}`)
  }
}
