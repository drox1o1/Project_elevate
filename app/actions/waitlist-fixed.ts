"use server"

export async function submitWaitlistFormFixed(formData: FormData) {
  // Add detailed logging
  console.log("🔍 Server Action: Starting waitlist submission")

  try {
    // Step 1: Extract and validate form data
    const name = formData.get("name") as string
    const ageStr = formData.get("age") as string
    const mobile = formData.get("mobile") as string
    const email = formData.get("email") as string

    console.log("📝 Form data received:", { name, age: ageStr, mobile, email })

    // Basic validation
    if (!name || !ageStr || !mobile || !email) {
      console.error("❌ Validation: Missing required fields")
      return {
        success: false,
        message: "Please fill in all required fields.",
      }
    }

    const age = Number.parseInt(ageStr)
    if (isNaN(age) || age < 13 || age > 120) {
      console.error("❌ Validation: Invalid age")
      return {
        success: false,
        message: "Please enter a valid age between 13 and 120.",
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("❌ Validation: Invalid email")
      return {
        success: false,
        message: "Please enter a valid email address.",
      }
    }

    console.log("✅ Validation passed")

    // Step 2: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Environment: Missing Supabase credentials")
      console.error("SUPABASE_URL:", supabaseUrl ? "Set" : "Missing")
      console.error("SUPABASE_KEY:", supabaseKey ? "Set" : "Missing")
      return {
        success: false,
        message: "Server configuration error. Please try again later.",
      }
    }

    console.log("✅ Environment variables found")

    // Step 3: Initialize Supabase client
    let supabase
    try {
      const { createClient } = await import("@supabase/supabase-js")
      supabase = createClient(supabaseUrl, supabaseKey)
      console.log("✅ Supabase client created")
    } catch (importError) {
      console.error("❌ Supabase import error:", importError)
      return {
        success: false,
        message: "Database connection error. Please try again later.",
      }
    }

    // Step 4: Check for existing user
    console.log("🔍 Checking for existing email...")
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("waitlist")
        .select("email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle()

      if (checkError) {
        console.error("❌ Database check error:", checkError.message)
        console.error("Error code:", checkError.code)
        console.error("Error details:", checkError.details)

        // If it's a table doesn't exist error
        if (checkError.code === "PGRST116") {
          return {
            success: false,
            message: "Database table not found. Please contact support.",
          }
        }

        return {
          success: false,
          message: "Database error. Please try again later.",
        }
      }

      if (existingUser) {
        console.log("⚠️ Email already exists")
        return {
          success: false,
          message: "This email is already registered on our waitlist.",
        }
      }

      console.log("✅ Email is unique")
    } catch (checkError) {
      console.error("❌ Exception during email check:", checkError)
      return {
        success: false,
        message: "Database error during validation. Please try again.",
      }
    }

    // Step 5: Insert new user
    console.log("💾 Inserting new user...")
    try {
      const userData = {
        name: name.trim(),
        age: age,
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
        email_sent: false,
        source: "website",
        metadata: {
          signup_timestamp: new Date().toISOString(),
          user_agent: "web_form",
        },
      }

      const { data: insertData, error: insertError } = await supabase
        .from("waitlist")
        .insert([userData])
        .select()
        .single()

      if (insertError) {
        console.error("❌ Insert error:", insertError.message)
        console.error("Error code:", insertError.code)
        console.error("Error details:", insertError.details)
        console.error("Error hint:", insertError.hint)

        // Handle specific error codes
        if (insertError.code === "23505") {
          return {
            success: false,
            message: "This email is already registered on our waitlist.",
          }
        }

        if (insertError.code === "PGRST116") {
          return {
            success: false,
            message: "Database table not found. Please contact support.",
          }
        }

        if (insertError.code === "42501") {
          return {
            success: false,
            message: "Database permission error. Please contact support.",
          }
        }

        return {
          success: false,
          message: "Failed to save your information. Please try again.",
        }
      }

      console.log("✅ User inserted successfully:", insertData.id)

      // Step 6: Send welcome email (optional - don't fail if this fails)
      try {
        console.log("📧 Attempting to send welcome email...")
        await sendWelcomeEmailSafe(userData)
        console.log("✅ Welcome email sent")
      } catch (emailError) {
        console.error("⚠️ Email error (non-fatal):", emailError)
        // Don't fail the whole operation for email issues
      }

      return {
        success: true,
        message:
          "🌟 Welcome to the Oriyali family! Thank you for joining our exclusive waitlist. Keep an eye on your inbox for updates!",
      }
    } catch (insertError) {
      console.error("❌ Exception during insert:", insertError)
      return {
        success: false,
        message: "Database error during signup. Please try again.",
      }
    }
  } catch (error) {
    console.error("❌ Unexpected server error:", error)
    console.error("Error stack:", error.stack)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again or contact support.",
    }
  }
}

// Safe email sending function
async function sendWelcomeEmailSafe(userData: any) {
  try {
    const emailProvider = process.env.EMAIL_PROVIDER
    const sendgridKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.FROM_EMAIL
    const fromName = process.env.FROM_NAME

    if (!emailProvider || !sendgridKey || !fromEmail || !fromName) {
      console.log("⚠️ Email configuration incomplete, skipping email")
      return
    }

    const sgMail = await import("@sendgrid/mail")
    sgMail.default.setApiKey(sendgridKey)

    const msg = {
      to: userData.email,
      from: fromEmail,
      subject: "Welcome to the Oriyali Family! 🌟",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF5B04;">✨ Welcome to Oriyali!</h1>
          <p>Dear ${userData.name},</p>
          <p>Thank you for joining our exclusive waitlist! You'll be among the first to experience personalized biorhythm insights.</p>
          <p>Keep an eye on your inbox for updates!</p>
          <p>Best regards,<br>The Oriyali Team</p>
        </div>
      `,
      text: `Welcome to Oriyali! Dear ${userData.name}, thank you for joining our waitlist. You'll be among the first to experience personalized biorhythm insights. Keep an eye on your inbox for updates! Best regards, The Oriyali Team`,
    }

    await sgMail.default.send(msg)
  } catch (emailError) {
    console.error("Email sending failed:", emailError)
    throw emailError
  }
}
