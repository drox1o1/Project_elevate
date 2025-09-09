// PRODUCTION DATABASE INTEGRATION
// Choose your preferred database and update this file

import { saveWaitlistUserSupabase, markEmailSent as markEmailSentSupabase } from "./database-supabase"
import { saveWaitlistUserNeon, markEmailSentNeon } from "./database-neon"
import { createEmailService } from "./email-service"

export interface WaitlistUser {
  id?: string
  name: string
  age: number
  mobile: string
  email: string
  createdAt?: Date
}

// Database provider selection
const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || "mock" // 'supabase', 'neon', or 'mock'

export async function saveWaitlistUser(
  userData: Omit<WaitlistUser, "id" | "createdAt">,
): Promise<{ success: boolean; message: string; userId?: string }> {
  console.log(`💾 Using ${DATABASE_PROVIDER} database provider`)

  switch (DATABASE_PROVIDER) {
    case "supabase":
      return await saveWaitlistUserSupabase(userData)

    case "neon":
      return await saveWaitlistUserNeon(userData)

    case "mock":
    default:
      // ⚠️ MOCK IMPLEMENTATION - DATA NOT SAVED
      console.log("⚠️  WARNING: Using MOCK database - data will NOT be saved!")
      console.log("Mock data:", userData)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      return {
        success: true,
        message: "User successfully added to waitlist (MOCK)",
        userId: `mock_${Date.now()}`,
      }
  }
}

export async function sendWelcomeEmail(userData: WaitlistUser): Promise<{ success: boolean; message: string }> {
  try {
    const emailService = createEmailService()

    const emailContent = {
      to: userData.email,
      from: process.env.FROM_EMAIL || "people@oriyali.com",
      fromName: process.env.FROM_NAME || "Oriyali",
      subject: "Welcome to the Oriyali Family! 🌟",
      html: generateWelcomeEmailHTML(userData),
      text: generateWelcomeEmailText(userData),
    }

    const result = await emailService.sendEmail(emailContent)

    if (result.success && userData.id) {
      // Mark email as sent in database
      if (DATABASE_PROVIDER === "supabase") {
        await markEmailSentSupabase(userData.id)
      } else if (DATABASE_PROVIDER === "neon") {
        await markEmailSentNeon(userData.id)
      }
    }

    return result
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return {
      success: false,
      message: "Failed to send welcome email",
    }
  }
}

// Email template functions (same as before)
function generateWelcomeEmailHTML(userData: WaitlistUser): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Oriyali</title>
      <style>
        body { font-family: 'Sorts Mill Goudy', serif; line-height: 1.6; color: #233038; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #FF5B04; margin-bottom: 10px; }
        .highlight { color: #FF5B04; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✨ Oriyali</div>
          <h1 style="color: #075056;">Welcome to the Future of Women's Wellness!</h1>
        </div>
        
        <p>Dear ${userData.name},</p>
        
        <p>🌟 <strong>Welcome to the Oriyali family!</strong> Thank you for joining our exclusive waitlist.</p>
        
        <p>You'll be among the first to experience personalized biorhythm insights that help you:</p>
        <ul>
          <li><span class="highlight">Predict</span> hormonal shifts before they happen</li>
          <li><span class="highlight">Optimize</span> your daily routines</li>
          <li><span class="highlight">Harmonize</span> your mood, energy, and focus</li>
        </ul>
        
        <p>Keep an eye on your inbox for exclusive updates!</p>
        
        <p>With gratitude,<br><strong>The Oriyali Team</strong></p>
      </div>
    </body>
    </html>
  `
}

function generateWelcomeEmailText(userData: WaitlistUser): string {
  return `
Welcome to the Oriyali Family! 🌟

Dear ${userData.name},

Welcome to the Oriyali family! Thank you for joining our exclusive waitlist.

You'll be among the first to experience personalized biorhythm insights that help you:
• Predict hormonal shifts before they happen
• Optimize your daily routines
• Harmonize your mood, energy, and focus

Keep an eye on your inbox for exclusive updates!

With gratitude,
The Oriyali Team
  `.trim()
}

export async function trackWaitlistSignup(userData: Omit<WaitlistUser, "id" | "createdAt">): Promise<void> {
  try {
    console.log("📊 Tracking waitlist signup:", {
      event: "waitlist_signup",
      user_age: userData.age,
      email_domain: userData.email.split("@")[1],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error tracking waitlist signup:", error)
  }
}
