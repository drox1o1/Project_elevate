import { sendEmailWithSendGrid } from "./email-providers/sendgrid"
import { sendEmailWithResend } from "./email-providers/resend"

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

export interface EmailData {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail(emailData: EmailData) {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || "sendgrid"

  console.log(`📧 Sending email via ${provider}...`)

  try {
    if (provider === "resend") {
      return await sendEmailWithResend(emailData)
    } else {
      return await sendEmailWithSendGrid(emailData)
    }
  } catch (error) {
    console.error(`❌ Email sending failed with ${provider}:`, error)
    throw error
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = "🌟 Welcome to Oriyali - Your Bio-Rhythm Journey Begins!"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Oriyali</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #075056 0%, #9ECFD6 100%); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .highlight { color: #FF5B04; font-weight: 600; }
        .cta { background: #FF5B04; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: 600; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
        .emoji { font-size: 24px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">✨</div>
          <h1>Welcome to Oriyali</h1>
          <p>Your Bio-Rhythm Journey Begins</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name}! 🌟</h2>
          
          <p>Thank you for joining our exclusive waitlist! You're now part of a select group who will be the first to experience <span class="highlight">Oriyali's revolutionary bio-rhythm technology</span>.</p>
          
          <h3>What happens next?</h3>
          <ul>
            <li>🔬 <strong>Early Access:</strong> You'll be among the first to try our AI-powered neuro-hormonal insights</li>
            <li>📱 <strong>Beta Testing:</strong> Help shape the future of women's wellness technology</li>
            <li>🎁 <strong>Exclusive Benefits:</strong> Special pricing and premium features for early supporters</li>
            <li>📧 <strong>Regular Updates:</strong> Behind-the-scenes insights into our development journey</li>
          </ul>
          
          <p>We're working hard to decode the invisible patterns that affect your mood, energy, and focus every day. Our mission is to help you <span class="highlight">unlock your innate rhythm</span> and live in harmony with your body's natural cycles.</p>
          
          <div style="text-align: center;">
            <a href="https://oriyali.com" class="cta">Learn More About Oriyali</a>
          </div>
          
          <p>Have questions? Simply reply to this email - we'd love to hear from you!</p>
          
          <p>With gratitude,<br>
          <strong>The Oriyali Team</strong><br>
          <em>Terramedici Lifesciences LLP</em></p>
        </div>
        
        <div class="footer">
          <p>© 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.</p>
          <p>You're receiving this because you signed up for our waitlist at oriyali.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Welcome to Oriyali, ${name}! ✨
    
    Thank you for joining our exclusive waitlist! You're now part of a select group who will be the first to experience Oriyali's revolutionary bio-rhythm technology.
    
    What happens next?
    • Early Access: You'll be among the first to try our AI-powered neuro-hormonal insights
    • Beta Testing: Help shape the future of women's wellness technology  
    • Exclusive Benefits: Special pricing and premium features for early supporters
    • Regular Updates: Behind-the-scenes insights into our development journey
    
    We're working hard to decode the invisible patterns that affect your mood, energy, and focus every day. Our mission is to help you unlock your innate rhythm and live in harmony with your body's natural cycles.
    
    Have questions? Simply reply to this email - we'd love to hear from you!
    
    With gratitude,
    The Oriyali Team
    Terramedici Lifesciences LLP
    
    © 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.
    You're receiving this because you signed up for our waitlist at oriyali.com
  `

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}

// Factory function to create email service
export function createEmailService(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER || "sendgrid"

  console.log(`📧 Initializing ${provider} email service...`)

  switch (provider.toLowerCase()) {
    case "resend":
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) {
        throw new Error("RESEND_API_KEY environment variable is required when using Resend")
      }
      return {
        sendEmail: async (params: EmailParams) => {
          try {
            await sendEmailWithResend({
              to: params.to,
              subject: params.subject,
              html: params.html,
              text: params.text,
            })
            return { success: true }
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            }
          }
        },
      }

    case "sendgrid":
      const sendgridKey = process.env.SENDGRID_API_KEY
      if (!sendgridKey) {
        throw new Error("SENDGRID_API_KEY environment variable is required when using SendGrid")
      }
      return {
        sendEmail: async (params: EmailParams) => {
          try {
            await sendEmailWithSendGrid({
              to: params.to,
              subject: params.subject,
              html: params.html,
              text: params.text,
            })
            return { success: true }
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            }
          }
        },
      }

    default:
      throw new Error(`Unsupported email provider: ${provider}. Supported providers: resend, sendgrid`)
  }
}

// Test email service configuration
export async function testEmailService(): Promise<{ success: boolean; provider: string; error?: string }> {
  try {
    const emailService = createEmailService()
    const provider = process.env.EMAIL_PROVIDER || "sendgrid"

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
