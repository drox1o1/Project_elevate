import { createClient } from "@/utils/supabase/server"
import { createEmailService } from "./email-service"

export interface WaitlistEntry {
  id?: string
  name: string
  email: string
  age: number
  mobile: string
  created_at?: string
  updated_at?: string
}

// Save waitlist entry to Supabase
export async function saveWaitlistEntry(entry: Omit<WaitlistEntry, "id" | "created_at" | "updated_at">) {
  try {
    console.log("🔄 Creating Supabase client...")
    const supabase = await createClient()

    console.log("📝 Inserting waitlist entry:", {
      name: entry.name,
      email: entry.email,
      age: entry.age,
      mobile: entry.mobile?.substring(0, 3) + "***", // Log partial mobile for privacy
    })

    const { data, error } = await supabase
      .from("waitlist")
      .insert([
        {
          name: entry.name,
          email: entry.email,
          age: entry.age,
          mobile: entry.mobile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Database error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("✅ Successfully saved to database:", data?.id)
    return data
  } catch (error) {
    console.error("❌ Failed to save waitlist entry:", error)
    throw error
  }
}

// Send welcome email and update status in database
export async function sendWelcomeEmail(userData: WaitlistEntry): Promise<{ success: boolean; message: string }> {
  try {
    console.log("📧 Initializing email service...")

    // Check if email is configured
    const emailProvider = process.env.EMAIL_PROVIDER || "sendgrid"
    console.log("📧 Using email provider:", emailProvider)

    if (emailProvider === "sendgrid" && !process.env.SENDGRID_API_KEY) {
      console.error("❌ Missing SENDGRID_API_KEY")
      return {
        success: false,
        message: "Email service not configured",
      }
    }

    if (emailProvider === "resend" && !process.env.RESEND_API_KEY) {
      console.error("❌ Missing RESEND_API_KEY")
      return {
        success: false,
        message: "Email service not configured",
      }
    }

    const emailService = createEmailService()

    const emailContent = {
      to: userData.email,
      from: process.env.FROM_EMAIL || "people@oriyali.com",
      fromName: process.env.FROM_NAME || "Oriyali",
      subject: "Welcome to the Oriyali Family! 🌟",
      html: generateWelcomeEmailHTML(userData),
      text: generateWelcomeEmailText(userData),
    }

    console.log("📧 Sending email to:", userData.email)
    const result = await emailService.sendEmail(emailContent)

    if (result.success && userData.id) {
      // Update email sent status in database
      const supabase = await createClient()
      await supabase
        .from("waitlist")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", userData.id)

      console.log("✅ Email status updated for user:", userData.id)
    }

    return result
  } catch (error) {
    console.error("Error sending welcome email:", error)

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return {
      success: false,
      message: "Failed to send welcome email",
    }
  }
}

// Get waitlist statistics
export async function getWaitlistStats(): Promise<{
  total: number
  today: number
  emailsSent: number
}> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const supabase = await createClient()

    const [totalResult, todayResult, emailsResult] = await Promise.all([
      supabase.from("waitlist").select("id", { count: "exact" }),
      supabase.from("waitlist").select("id", { count: "exact" }).gte("created_at", today),
      supabase.from("waitlist").select("id", { count: "exact" }).eq("email_sent", true),
    ])

    return {
      total: totalResult.count || 0,
      today: todayResult.count || 0,
      emailsSent: emailsResult.count || 0,
    }
  } catch (error) {
    console.error("Error getting waitlist stats:", error)
    return { total: 0, today: 0, emailsSent: 0 }
  }
}

// Analytics function to track waitlist signups
export async function trackWaitlistSignup(
  userData: Omit<WaitlistEntry, "id" | "created_at" | "updated_at">,
): Promise<void> {
  try {
    console.log("📊 Tracking waitlist signup:", {
      event: "waitlist_signup",
      user_age: userData.age,
      email_domain: userData.email.split("@")[1],
      timestamp: new Date().toISOString(),
    })

    // You can add additional analytics tracking here
    // Example with Google Analytics 4:
    // gtag('event', 'waitlist_signup', {
    //   'user_age': userData.age,
    //   'email_domain': userData.email.split('@')[1]
    // })
  } catch (error) {
    console.error("Error tracking waitlist signup:", error)
  }
}

// Generate HTML email content
function generateWelcomeEmailHTML(userData: WaitlistEntry): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Oriyali</title>
      <style>
        body { 
          font-family: 'Sorts Mill Goudy', serif; 
          line-height: 1.6; 
          color: #233038; 
          margin: 0; 
          padding: 0; 
          background-color: #FDF6E3;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding: 20px 0;
          border-bottom: 2px solid #FF5B04;
        }
        .logo { 
          font-size: 32px; 
          font-weight: bold; 
          color: #FF5B04; 
          margin-bottom: 10px; 
        }
        .content { 
          padding: 20px 0; 
        }
        .highlight { 
          color: #FF5B04; 
          font-weight: bold; 
        }
        .features {
          background: #FDF6E3;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .features ul {
          margin: 0;
          padding-left: 20px;
        }
        .features li {
          margin: 10px 0;
        }
        .button { 
          display: inline-block; 
          background: #FF5B04; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 25px; 
          margin: 20px 0;
          font-weight: bold;
        }
        .footer { 
          text-align: center; 
          font-size: 14px; 
          color: #666; 
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #D3DBDD;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          color: #FF5B04;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✨ Oriyali</div>
          <h1 style="color: #075056; margin: 0; font-size: 28px;">Welcome to the Future of Women's Wellness!</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 18px;">Dear ${userData.name},</p>
          
          <p>🌟 <strong>Welcome to the Oriyali family!</strong> Thank you for joining our exclusive waitlist. We're putting the finishing touches on something truly revolutionary for women's wellness.</p>
          
          <p>You'll be among the first to experience the future of personalized biorhythm insights. Our AI-powered platform will help you:</p>
          
          <div class="features">
            <ul>
              <li><span class="highlight">Predict</span> hormonal shifts before they happen</li>
              <li><span class="highlight">Optimize</span> your daily routines based on your unique patterns</li>
              <li><span class="highlight">Harmonize</span> your mood, energy, and focus every day</li>
              <li><span class="highlight">Understand</span> your body's natural rhythms throughout all life stages</li>
            </ul>
          </div>
          
          <p>Keep an eye on your inbox – we'll be in touch soon with:</p>
          <ul>
            <li>🎯 Exclusive early access opportunities</li>
            <li>📚 Educational content about biorhythms</li>
            <li>🔬 Latest research insights</li>
            <li>💡 Personalized wellness tips</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="https://oriyali.com" class="button">Learn More About Oriyali</a>
          </div>
          
          <p>Thank you for believing in the future of proactive women's wellness. Together, we're creating something extraordinary.</p>
          
          <p style="margin-top: 30px;">With gratitude,<br>
          <strong>The Oriyali Team</strong><br>
          <em>Terramedici Lifesciences LLP</em></p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://oriyali.com">Website</a> |
            <a href="mailto:people@oriyali.com">Contact Us</a>
          </div>
          <p>© 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.</p>
          <p style="font-size: 12px; color: #999;">
            You're receiving this email because you joined our waitlist at oriyali.com<br>
            If you no longer wish to receive these emails, please contact us at people@oriyali.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text email content
function generateWelcomeEmailText(userData: WaitlistEntry): string {
  return `
Welcome to the Oriyali Family! 🌟

Dear ${userData.name},

Welcome to the Oriyali family! Thank you for joining our exclusive waitlist. We're putting the finishing touches on something truly revolutionary for women's wellness.

You'll be among the first to experience the future of personalized biorhythm insights. Our AI-powered platform will help you:

• Predict hormonal shifts before they happen
• Optimize your daily routines based on your unique patterns  
• Harmonize your mood, energy, and focus every day
• Understand your body's natural rhythms throughout all life stages

Keep an eye on your inbox – we'll be in touch soon with:
🎯 Exclusive early access opportunities
📚 Educational content about biorhythms
🔬 Latest research insights
💡 Personalized wellness tips

Visit us at: https://oriyali.com

Thank you for believing in the future of proactive women's wellness. Together, we're creating something extraordinary.

With gratitude,
The Oriyali Team
Terramedici Lifesciences LLP

---
© 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.
You're receiving this email because you joined our waitlist at oriyali.com
If you no longer wish to receive these emails, please contact us at people@oriyali.com
  `.trim()
}

// Check database connection
export async function checkDatabaseConnection() {
  try {
    console.log("🔄 Testing database connection...")
    const supabase = await createClient()

    // Test basic connection
    const { data, error } = await supabase.from("waitlist").select("count").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Database connection successful")
    return { success: true, data }
  } catch (error) {
    console.error("❌ Database connection error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
