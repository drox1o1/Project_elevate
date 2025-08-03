import { Resend } from "resend"
import type { EmailData } from "../email-service"

export async function sendEmailWithResend(emailData: EmailData) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL || "people@oriyali.com"
  const fromName = process.env.FROM_NAME || "Oriyali"

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  const resend = new Resend(apiKey)

  try {
    console.log("📧 Sending email via Resend to:", emailData.to)
    const response = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    })

    console.log("✅ Resend email sent successfully:", response.data?.id)
    return response
  } catch (error) {
    console.error("❌ Resend error:", error)
    throw error
  }
}
