// Database utility functions
// This implementation can be adapted to your specific database (Supabase, Neon, etc.)

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
export async function sendWelcomeEmail(
  userData: WaitlistUser,
  config?: EmailConfig,
): Promise<{ success: boolean; message: string }> {
  try {
    // This is a mock implementation
    // Replace with your actual email service (Resend, SendGrid, etc.)

    console.log("Sending welcome email to:", userData.email)

    const emailContent = {
      to: userData.email,
      from: config?.fromEmail || "hello@oriyali.com",
      fromName: config?.fromName || "Oriyali Team",
      subject: "Welcome to the Oriyali Family! 🌟",
      html: generateWelcomeEmailHTML(userData),
      text: generateWelcomeEmailText(userData),
    }

    // Example with Resend (uncomment and configure):
    // const resend = new Resend(config?.apiKey || process.env.RESEND_API_KEY)
    // const result = await resend.emails.send(emailContent)

    // Example with SendGrid (uncomment and configure):
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(config?.apiKey || process.env.SENDGRID_API_KEY)
    // const result = await sgMail.send(emailContent)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("Welcome email sent successfully")

    return {
      success: true,
      message: "Welcome email sent successfully",
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
        body { font-family: 'Sorts Mill Goudy', serif; line-height: 1.6; color: #233038; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #FF5B04; margin-bottom: 10px; }
        .content { background: #FDF6E3; padding: 30px; border-radius: 12px; margin-bottom: 20px; }
        .highlight { color: #FF5B04; font-weight: bold; }
        .footer { text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; background: #FF5B04; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✨ Oriyali</div>
          <h1 style="color: #075056; margin: 0;">Welcome to the Future of Women's Wellness!</h1>
        </div>
        
        <div class="content">
          <p>Dear ${userData.name},</p>
          
          <p>🌟 <strong>Welcome to the Oriyali family!</strong> Thank you for joining our exclusive waitlist. We're putting the finishing touches on something truly revolutionary for women's wellness.</p>
          
          <p>You'll be among the first to experience the future of personalized biorhythm insights. Our AI-powered platform will help you:</p>
          
          <ul>
            <li><span class="highlight">Predict</span> hormonal shifts before they happen</li>
            <li><span class="highlight">Optimize</span> your daily routines based on your unique patterns</li>
            <li><span class="highlight">Harmonize</span> your mood, energy, and focus every day</li>
          </ul>
          
          <p>Keep an eye on your inbox – we'll be in touch soon with exciting updates, early access opportunities, and exclusive content just for our waitlist members.</p>
          
          <div style="text-align: center;">
            <a href="https://oriyali.com" class="button">Learn More About Oriyali</a>
          </div>
          
          <p>Thank you for believing in the future of proactive women's wellness. Together, we're creating something extraordinary.</p>
          
          <p>With gratitude,<br>
          <strong>The Oriyali Team</strong><br>
          Terramedici Lifesciences LLP</p>
        </div>
        
        <div class="footer">
          <p>© 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.</p>
          <p>You're receiving this email because you joined our waitlist at oriyali.com</p>
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

Keep an eye on your inbox – we'll be in touch soon with exciting updates, early access opportunities, and exclusive content just for our waitlist members.

Thank you for believing in the future of proactive women's wellness. Together, we're creating something extraordinary.

With gratitude,
The Oriyali Team
Terramedici Lifesciences LLP

---
© 2025 Oriyali by Terramedici Lifesciences LLP. All Rights Reserved.
You're receiving this email because you joined our waitlist at oriyali.com
  `.trim()
}

// Analytics function to track waitlist signups
export async function trackWaitlistSignup(userData: Omit<WaitlistUser, "id" | "createdAt">): Promise<void> {
  try {
    // Track signup event for analytics
    // Example with Google Analytics, Mixpanel, etc.
    console.log("Tracking waitlist signup:", {
      event: "waitlist_signup",
      user_age: userData.age,
      timestamp: new Date().toISOString(),
    })

    // Example with Google Analytics 4:
    // gtag('event', 'waitlist_signup', {
    //   'custom_parameter': 'value'
    // })

    // Example with Mixpanel:
    // mixpanel.track('Waitlist Signup', {
    //   'Age': userData.age,
    //   'Email Domain': userData.email.split('@')[1]
    // })
  } catch (error) {
    console.error("Error tracking waitlist signup:", error)
    // Don't throw error - analytics failure shouldn't break the flow
  }
}
