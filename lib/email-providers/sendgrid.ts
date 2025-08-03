import sgMail from "@sendgrid/mail"
import type { EmailData } from "../email-service"

export async function sendEmailWithSendGrid(emailData: EmailData) {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.FROM_EMAIL || "people@oriyali.com"
  const fromName = process.env.FROM_NAME || "Oriyali"

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured")
  }

  sgMail.setApiKey(apiKey)

  const msg = {
    to: emailData.to,
    from: {
      email: fromEmail,
      name: fromName,
    },
    subject: emailData.subject,
    text: emailData.text,
    html: emailData.html,
  }

  try {
    console.log("📧 Sending email via SendGrid to:", emailData.to)
    const response = await sgMail.send(msg)
    console.log("✅ SendGrid email sent successfully:", response[0].statusCode)
    return response
  } catch (error) {
    console.error("❌ SendGrid error:", error)
    throw error
  }
}
