import type { EmailData } from "../email-service"

export async function sendEmailWithResend(emailData: EmailData) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL || "people@oriyali.com"
  const fromName = process.env.FROM_NAME || "Oriyali"

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  // Dynamic import to avoid issues if resend is not installed
  let Resend: any
  try {
    const resendModule = await import("resend")
    Resend = resendModule.Resend
  } catch (error) {
    console.error("❌ Resend package not found. Install with: npm install resend")
    throw new Error("Resend package not installed")
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
      tags: [
        { name: "category", value: "waitlist" },
        { name: "source", value: "oriyali-website" },
      ],
    })

    console.log("✅ Resend email sent successfully:", response.data?.id)
    return response
  } catch (error) {
    console.error("❌ Resend error:", error)
    throw error
  }
}
