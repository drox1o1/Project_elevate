import { supabaseAdmin } from "./supabase-server"
import { createEmailService } from "./email-service"

export interface WaitlistUser {
  id?: string
  name: string
  age: number
  mobile: string
  email: string
  createdAt?: Date
}

// Save waitlist user to Supabase
export async function saveWaitlistUser(
  userData: Omit<WaitlistUser, "id" | "createdAt">,
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    console.log("💾 Saving user to Supabase waitlist:", userData.email)

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL")
      return {
        success: false,
        message: "Database configuration error. Please contact support.",
      }
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("❌ Missing Supabase keys")
      return {
        success: false,
        message: "Database configuration error. Please contact support.",
      }
    }

    // Test database connection
    console.log("🔍 Testing database connection...")
    const { data: testData, error: testError } = await supabaseAdmin
      .from("waitlist")
      .select("count", { count: "exact" })
      .limit(1)

    if (testError) {
      console.error("❌ Database connection test failed:", testError)

      if (testError.code === "PGRST116") {
        return {
          success: false,
          message: "Database table not found. Please contact support at people@oriyali.com.",
        }
      }

      return {
        success: false,
        message: "Database connection failed. Please try again later.",
      }
    }

    console.log("✅ Database connection successful")

    // Check for existing user
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("waitlist")
      .select("email")
      .eq("email", userData.email)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing user:", checkError)
      return {
        success: false,
        message: "Database error. Please try again later.",
      }
    }

    if (existingUser) {
      console.log("⚠️ User already exists:", userData.email)
      return {
        success: false,
        message: "This email is already registered on our waitlist.",
      }
    }

    // Collect additional metadata
    const metadata = {
      signup_timestamp: new Date().toISOString(),
      signup_source: "website",
      user_agent: "web_form",
    }

    // Insert new user
    console.log("💾 Inserting new user...")
    const { data, error } = await supabaseAdmin
      .from("waitlist")
      .insert([
        {
          name: userData.name,
          age: userData.age,
          mobile: userData.mobile,
          email: userData.email,
          created_at: new Date().toISOString(),
          email_sent: false,
          source: "website",
          metadata: metadata,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error saving user:", error)

      // Handle specific error codes
      if (error.code === "23505") {
        return {
          success: false,
          message: "This email is already registered on our waitlist.",
        }
      }

      if (error.code === "PGRST116") {
        return {
          success: false,
          message: "Database table not found. Please contact support at people@oriyali.com.",
        }
      }

      return {
        success: false,
        message: "Failed to save user data. Please try again.",
      }
    }

    console.log("✅ User saved to Supabase successfully:", data.id)

    return {
      success: true,
      message: "User successfully added to waitlist",
      userId: data.id,
    }
  } catch (error) {
    console.error("Error saving user to waitlist:", error)

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return {
      success: false,
      message: "Failed to save user data. Please try again.",
    }
  }
}

// Send welcome email and update status in database
export async function sendWelcomeEmail(userData: WaitlistUser): Promise<{ success: boolean; message: string }> {
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
      await supabaseAdmin
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

    const [totalResult, todayResult, emailsResult] = await Promise.all([
      supabaseAdmin.from("waitlist").select("id", { count: "exact" }),
      supabaseAdmin.from("waitlist").select("id", { count: "exact" }).gte("created_at", today),
      supabaseAdmin.from("waitlist").select("id", { count: "exact" }).eq("email_sent", true),
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
export async function trackWaitlistSignup(userData: Omit<WaitlistUser, "id" | "createdAt">): Promise<void> {
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
function generateWelcomeEmailHTML(userData: WaitlistUser): string {
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
function generateWelcomeEmailText(userData: WaitlistUser): string {
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
