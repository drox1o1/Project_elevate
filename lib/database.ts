// Database utility functions
// This implementation can be adapted to your specific database (Supabase, Neon, etc.)

import { createEmailService } from "./email-service"

export interface WaitlistUser {
  id?: string
  name: string
  age: number
  mobile: string
  email: string
  createdAt?: Date
}

// Email service configuration
interface EmailConfig {
  apiKey: string
  fromEmail: string
  fromName: string
}

// Mock database function - replace with your actual database implementation
export async function saveWaitlistUser(
  userData: Omit<WaitlistUser, "id" | "createdAt">,
): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      }
    }

    // Check for duplicate email (mock implementation)
    // In a real implementation, you would check your database
    const existingUser = await checkExistingUser(userData.email)
    if (existingUser) {
      return {
        success: false,
        message: "This email is already registered on our waitlist.",
      }
    }

    // Simulate database save operation
    console.log("Saving user to waitlist:", userData)

    // Generate a mock user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Here you would typically:
    // 1. Connect to your database
    // 2. Insert the user data
    // 3. Handle any validation or duplicate checking

    // Example for different databases:
    // Supabase:
    // const { data, error } = await supabase
    //   .from('waitlist')
    //   .insert([{ ...userData, created_at: new Date().toISOString() }])
    //   .select()

    // Neon:
    // const result = await sql`
    //   INSERT INTO waitlist (name, age, mobile, email, created_at)
    //   VALUES (${userData.name}, ${userData.age}, ${userData.mobile}, ${userData.email}, ${new Date().toISOString()})
    //   RETURNING id
    // `

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "User successfully added to waitlist",
      userId: userId,
    }
  } catch (error) {
    console.error("Error saving user to waitlist:", error)
    return {
      success: false,
      message: "Failed to save user data. Please try again.",
    }
  }
}

// Mock function to check existing users
async function checkExistingUser(email: string): Promise<boolean> {
  // In a real implementation, query your database
  // For now, return false (no duplicates)
  return false
}

// Email sending function
export async function sendWelcomeEmail(userData: WaitlistUser): Promise<{ success: boolean; message: string }> {
  try {
    const emailService = createEmailService()

    const emailContent = {
      to: userData.email,
      from: process.env.FROM_EMAIL || "hello@oriyali.com",
      fromName: process.env.FROM_NAME || "Oriyali Team",
      subject: "Welcome to the Oriyali Family! 🌟",
      html: generateWelcomeEmailHTML(userData),
      text: generateWelcomeEmailText(userData),
    }

    const result = await emailService.sendEmail(emailContent)

    if (result.success) {
      console.log("Welcome email sent successfully to:", userData.email)
      return {
        success: true,
        message: "Welcome email sent successfully",
      }
    } else {
      console.error("Failed to send welcome email:", result.error)
      return {
        success: false,
        message: result.error || "Failed to send welcome email",
      }
    }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return {
      success: false,
      message: "Failed to send welcome email",
    }
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
            <a href="mailto:hello@oriyali.com">Contact Us</a>
          </div>
          <p>© 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.</p>
          <p style="font-size: 12px; color: #999;">
            You're receiving this email because you joined our waitlist at oriyali.com<br>
            If you no longer wish to receive these emails, please contact us at hello@oriyali.com
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
If you no longer wish to receive these emails, please contact us at hello@oriyali.com
  `.trim()
}

// Analytics function to track waitlist signups
export async function trackWaitlistSignup(userData: Omit<WaitlistUser, "id" | "createdAt">): Promise<void> {
  try {
    console.log("Tracking waitlist signup:", {
      event: "waitlist_signup",
      user_age: userData.age,
      timestamp: new Date().toISOString(),
    })

    // TODO: Add your analytics tracking here
    // Example with Google Analytics 4:
    // gtag('event', 'waitlist_signup', {
    //   'user_age': userData.age,
    //   'email_domain': userData.email.split('@')[1]
    // })

    // Example with Mixpanel:
    // mixpanel.track('Waitlist Signup', {
    //   'Age': userData.age,
    //   'Email Domain': userData.email.split('@')[1]
    // })
  } catch (error) {
    console.error("Error tracking waitlist signup:", error)
  }
}
