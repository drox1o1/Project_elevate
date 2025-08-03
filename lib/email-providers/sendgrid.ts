import type { EmailData } from "../email-service"

export async function sendEmailWithSendGrid(emailData: EmailData) {
  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.FROM_EMAIL || "people@oriyali.com"
  const fromName = process.env.FROM_NAME || "Oriyali"

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured")
  }

  // Dynamic import to avoid issues if @sendgrid/mail is not installed
  let sgMail: any
  try {
    sgMail = await import("@sendgrid/mail")
    sgMail = sgMail.default || sgMail
  } catch (error) {
    console.error("❌ SendGrid package not found. Install with: npm install @sendgrid/mail")
    throw new Error("SendGrid package not installed")
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
    categories: ["waitlist", "oriyali-website"],
    customArgs: {
      source: "waitlist-signup",
      version: "v1",
      timestamp: new Date().toISOString(),
    },
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

  try {
    console.log("📧 Sending email via SendGrid to:", emailData.to)
    const response = await sgMail.send(msg)
    console.log("✅ SendGrid email sent successfully:", response[0].statusCode)
    return response
  } catch (error: any) {
    console.error("❌ SendGrid error:", error)

    let errorMessage = "Failed to send email"
    if (error.response?.body?.errors) {
      errorMessage = error.response.body.errors.map((e: any) => e.message).join(", ")
      console.error("SendGrid API errors:", error.response.body.errors)
    } else if (error.message) {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}
